use crate::db::models::MemoryItem;
use crate::db::Database;
use chrono::{Datelike, Local, TimeZone, Timelike};
use regex::Regex;

#[derive(Debug, Clone)]
pub struct ParsedQuery {
    pub raw_query: String,
    pub search_terms: Vec<String>,
    pub start_time: Option<i64>,
    pub end_time: Option<i64>,
    pub date_filter_label: Option<String>,
}

pub fn parse_query(query: &str) -> ParsedQuery {
    let lower = query.to_lowercase();
    let now = Local::now();

    let mut start_time: Option<i64> = None;
    let mut end_time: Option<i64> = None;
    let mut date_filter_label: Option<String> = None;

    // Detect deterministic date constraints
    if lower.contains("yesterday") {
        let yesterday = now - chrono::Duration::days(1);
        if let Some(start) = Local
            .with_ymd_and_hms(yesterday.year(), yesterday.month(), yesterday.day(), 0, 0, 0)
            .single()
        {
            start_time = Some(start.timestamp_millis());
            end_time = Some(start.timestamp_millis() + 86_400_000 - 1);
            date_filter_label = Some("Yesterday".to_string());
        }
    } else if lower.contains("today") {
        if let Some(start) = Local
            .with_ymd_and_hms(now.year(), now.month(), now.day(), 0, 0, 0)
            .single()
        {
            start_time = Some(start.timestamp_millis());
            end_time = Some(now.timestamp_millis());
            date_filter_label = Some("Today".to_string());
        }
    } else if lower.contains("last week") || lower.contains("past week") {
        let week_ago = now - chrono::Duration::days(7);
        start_time = Some(week_ago.timestamp_millis());
        end_time = Some(now.timestamp_millis());
        date_filter_label = Some("Last 7 Days".to_string());
    } else if lower.contains("this week") {
        let weekday = now.weekday().num_days_from_monday();
        let monday = now - chrono::Duration::days(weekday as i64);
        if let Some(start) = Local
            .with_ymd_and_hms(monday.year(), monday.month(), monday.day(), 0, 0, 0)
            .single()
        {
            start_time = Some(start.timestamp_millis());
            end_time = Some(now.timestamp_millis());
            date_filter_label = Some("This Week".to_string());
        }
    } else if lower.contains("last month") || lower.contains("past 30 days") {
        let month_ago = now - chrono::Duration::days(30);
        start_time = Some(month_ago.timestamp_millis());
        end_time = Some(now.timestamp_millis());
        date_filter_label = Some("Past 30 Days".to_string());
    }

    // Clean stop words and date phrases from query
    let mut cleaned = lower;
    for phrase in &[
        "yesterday", "today", "last week", "past week", "this week", "last month", "past 30 days",
        "find that", "find the", "find", "show me", "look for", "that website about",
        "that article about", "that page about", "the website about", "the article about",
        "the page about", "that website", "that article", "that page", "website about",
        "article about", "page about", "i saw", "i opened", "i visited", "i read", "i looked at",
    ] {
        cleaned = cleaned.replace(phrase, " ");
    }

    // Tokenize into keywords
    let re = Regex::new(r"[a-zA-Z0-9_\-\.]+").unwrap();
    let stop_words: std::collections::HashSet<&str> = [
        "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with",
        "about", "from", "of", "by", "is", "was", "were", "it", "that", "this", "my",
    ].iter().cloned().collect();

    let mut search_terms = Vec::new();
    for mat in re.find_iter(&cleaned) {
        let word = mat.as_str();
        if !stop_words.contains(word) && word.len() >= 2 {
            search_terms.push(word.to_string());
        }
    }

    ParsedQuery {
        raw_query: query.to_string(),
        search_terms,
        start_time,
        end_time,
        date_filter_label,
    }
}

pub fn format_relative_time(timestamp_ms: i64) -> String {
    let now = Local::now().timestamp_millis();
    let diff_ms = now - timestamp_ms;
    if diff_ms < 0 {
        return "Just now".to_string();
    }

    let diff_secs = diff_ms / 1000;
    let diff_mins = diff_secs / 60;
    let diff_hours = diff_mins / 60;
    let diff_days = diff_hours / 24;

    if diff_mins < 1 {
        "Just now".to_string()
    } else if diff_mins < 60 {
        format!("{}m ago", diff_mins)
    } else if diff_hours < 24 {
        format!("{}h ago", diff_hours)
    } else {
        if let Some(date_time) = Local.timestamp_millis_opt(timestamp_ms).single() {
            let now_local = Local::now();
            let is_today = date_time.date_naive() == now_local.date_naive();
            let is_yesterday = (now_local.date_naive() - date_time.date_naive()).num_days() == 1;

            let hour_12 = if date_time.hour() == 0 {
                12
            } else if date_time.hour() > 12 {
                date_time.hour() - 12
            } else {
                date_time.hour()
            };
            let am_pm = if date_time.hour() >= 12 { "PM" } else { "AM" };
            let time_str = format!("{}:{:02} {}", hour_12, date_time.minute(), am_pm);

            if is_today {
                format!("Today · {}", time_str)
            } else if is_yesterday {
                format!("Yesterday · {}", time_str)
            } else if diff_days < 7 {
                format!("{} · {}", date_time.format("%A"), time_str)
            } else {
                format!("{} · {}", date_time.format("%b %d"), time_str)
            }
        } else {
            format!("{}d ago", diff_days)
        }
    }
}

pub fn search(db: &Database, query: &str, limit: usize) -> Result<Vec<MemoryItem>, String> {
    let trimmed = query.trim();
    if trimmed.is_empty() {
        let mut items = db.get_recent_items(limit)
            .map_err(|e| format!("Failed to get recent items: {}", e))?;
        for item in &mut items {
            item.relative_time = Some(format_relative_time(item.last_visit_time));
        }
        return Ok(items);
    }

    let parsed = parse_query(trimmed);

    // If no search terms left after stop word filtering (e.g. user only typed "yesterday")
    if parsed.search_terms.is_empty() {
        let mut items = db.search_fallback_like(&[], parsed.start_time, parsed.end_time, limit)
            .map_err(|e| format!("Search failed: {}", e))?;
        for item in &mut items {
            item.relative_time = Some(format_relative_time(item.last_visit_time));
        }
        return Ok(items);
    }

    // Construct SQLite FTS5 query
    // e.g. "term1"* AND "term2"*
    let fts_terms: Vec<String> = parsed
        .search_terms
        .iter()
        .map(|t| {
            let sanitized = t.replace('"', "");
            format!("\"{}\"*", sanitized)
        })
        .collect();
    let fts_query = fts_terms.join(" AND ");

    let items = match db.search_fts(&fts_query, parsed.start_time, parsed.end_time, limit * 2) {
        Ok(results) if !results.is_empty() => results,
        _ => {
            // Fallback to LIKE search if FTS returned nothing or errored
            db.search_fallback_like(
                &parsed.search_terms,
                parsed.start_time,
                parsed.end_time,
                limit * 2,
            ).unwrap_or_default()
        }
    };

    // Calculate ranking scores
    let query_lower = trimmed.to_lowercase();
    let now_ms = Local::now().timestamp_millis() as f64;

    let mut scored_items: Vec<(MemoryItem, f64)> = items
        .into_iter()
        .map(|mut item| {
            item.relative_time = Some(format_relative_time(item.last_visit_time));
            let title_lower = item.title.to_lowercase();
            let domain_lower = item.domain.to_lowercase();
            let url_lower = item.url.to_lowercase();

            let mut score = 0.0;

            // 1. Exact title matches
            if title_lower == query_lower {
                score += 150.0;
            } else if title_lower.contains(&query_lower) {
                score += 80.0;
            }

            // 2. Domain matches
            if domain_lower == query_lower || domain_lower.starts_with(&query_lower) {
                score += 70.0;
            } else if domain_lower.contains(&query_lower) {
                score += 50.0;
            }

            // 3. Keyword matches in title
            for term in &parsed.search_terms {
                let term_lower = term.to_lowercase();
                if title_lower.contains(&term_lower) {
                    score += 25.0;
                }
                if domain_lower.contains(&term_lower) {
                    score += 20.0;
                }
                if url_lower.contains(&term_lower) {
                    score += 10.0;
                }
            }

            // 4. Visit count boost (frequently visited items rank higher)
            score += (item.visit_count as f64).min(20.0) * 1.5;

            // 5. Recency boost (within last 30 days)
            let age_hours = (now_ms - item.last_visit_time as f64) / 3_600_000.0;
            if age_hours < 24.0 {
                score += 25.0;
            } else if age_hours < 72.0 {
                score += 15.0;
            } else if age_hours < 168.0 {
                score += 10.0;
            }

            (item, score)
        })
        .collect();

    // Sort descending by score
    scored_items.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

    let final_items: Vec<MemoryItem> = scored_items
        .into_iter()
        .take(limit)
        .map(|(item, _)| item)
        .collect();

    Ok(final_items)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_query_keywords() {
        let parsed = parse_query("find that article about React I saw yesterday");
        assert!(parsed.search_terms.contains(&"react".to_string()));
        assert_eq!(parsed.date_filter_label, Some("Yesterday".to_string()));
        assert!(parsed.start_time.is_some());
        assert!(parsed.end_time.is_some());
    }

    #[test]
    fn test_parse_query_today() {
        let parsed = parse_query("github pull requests today");
        assert!(parsed.search_terms.contains(&"github".to_string()));
        assert!(parsed.search_terms.contains(&"pull".to_string()));
        assert!(parsed.search_terms.contains(&"requests".to_string()));
        assert_eq!(parsed.date_filter_label, Some("Today".to_string()));
    }

    #[test]
    fn test_parse_query_last_week() {
        let parsed = parse_query("openai pricing last week");
        assert!(parsed.search_terms.contains(&"openai".to_string()));
        assert!(parsed.search_terms.contains(&"pricing".to_string()));
        assert_eq!(parsed.date_filter_label, Some("Last 7 Days".to_string()));
    }

    #[test]
    fn test_format_relative_time() {
        let now = Local::now().timestamp_millis();
        assert_eq!(format_relative_time(now - 10_000), "Just now");
        assert_eq!(format_relative_time(now - 5 * 60_000), "5m ago");
        assert_eq!(format_relative_time(now - 2 * 3600_000), "2h ago");
    }
}
