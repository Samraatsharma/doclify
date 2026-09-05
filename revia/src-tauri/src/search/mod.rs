pub mod semantic;

use crate::db::models::MemoryItem;
use crate::db::Database;
use chrono::{Datelike, Duration, Local, TimeZone, Timelike, Weekday};
use regex::Regex;
use semantic::SemanticEngine;

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

    // Detect deterministic date and time of day constraints
    if lower.contains("this morning") {
        if let Some(start) = Local.with_ymd_and_hms(now.year(), now.month(), now.day(), 6, 0, 0).single() {
            start_time = Some(start.timestamp_millis());
            end_time = Some(start.timestamp_millis() + 6 * 3_600_000);
            date_filter_label = Some("This Morning".to_string());
        }
    } else if lower.contains("this afternoon") {
        if let Some(start) = Local.with_ymd_and_hms(now.year(), now.month(), now.day(), 12, 0, 0).single() {
            start_time = Some(start.timestamp_millis());
            end_time = Some(start.timestamp_millis() + 6 * 3_600_000);
            date_filter_label = Some("This Afternoon".to_string());
        }
    } else if lower.contains("tonight") || lower.contains("this evening") {
        if let Some(start) = Local.with_ymd_and_hms(now.year(), now.month(), now.day(), 18, 0, 0).single() {
            start_time = Some(start.timestamp_millis());
            end_time = Some(start.timestamp_millis() + 6 * 3_600_000);
            date_filter_label = Some("Tonight".to_string());
        }
    } else if lower.contains("yesterday") {
        let yesterday = now - Duration::days(1);
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
    } else if lower.contains("last few days") || lower.contains("past few days") || lower.contains("few days ago") {
        let three_days_ago = now - Duration::days(3);
        start_time = Some(three_days_ago.timestamp_millis());
        end_time = Some(now.timestamp_millis());
        date_filter_label = Some("Past Few Days".to_string());
    } else if lower.contains("two weeks ago") || lower.contains("2 weeks ago") {
        let start = now - Duration::days(14);
        let end = now - Duration::days(7);
        start_time = Some(start.timestamp_millis());
        end_time = Some(end.timestamp_millis());
        date_filter_label = Some("Two Weeks Ago".to_string());
    } else if lower.contains("last week") || lower.contains("past week") {
        let week_ago = now - Duration::days(7);
        start_time = Some(week_ago.timestamp_millis());
        end_time = Some(now.timestamp_millis());
        date_filter_label = Some("Last 7 Days".to_string());
    } else if lower.contains("this week") {
        let weekday = now.weekday().num_days_from_monday();
        let monday = now - Duration::days(weekday as i64);
        if let Some(start) = Local
            .with_ymd_and_hms(monday.year(), monday.month(), monday.day(), 0, 0, 0)
            .single()
        {
            start_time = Some(start.timestamp_millis());
            end_time = Some(now.timestamp_millis());
            date_filter_label = Some("This Week".to_string());
        }
    } else if lower.contains("last month") || lower.contains("past 30 days") {
        let month_ago = now - Duration::days(30);
        start_time = Some(month_ago.timestamp_millis());
        end_time = Some(now.timestamp_millis());
        date_filter_label = Some("Past 30 Days".to_string());
    } else {
        // Check days of week (e.g. "Tuesday", "last Tuesday")
        let days = [
            ("monday", Weekday::Mon),
            ("tuesday", Weekday::Tue),
            ("wednesday", Weekday::Wed),
            ("thursday", Weekday::Thu),
            ("friday", Weekday::Fri),
            ("saturday", Weekday::Sat),
            ("sunday", Weekday::Sun),
        ];

        for (name, weekday) in days {
            if lower.contains(name) {
                let current_day = now.weekday();
                let days_back = if lower.contains(&format!("last {}", name)) {
                    let diff = (current_day.num_days_from_monday() as i64) - (weekday.num_days_from_monday() as i64);
                    if diff <= 0 { diff + 7 + 7 } else { diff + 7 }
                } else {
                    let diff = (current_day.num_days_from_monday() as i64) - (weekday.num_days_from_monday() as i64);
                    if diff < 0 { diff + 7 } else if diff == 0 { 7 } else { diff }
                };

                let target_date = now - Duration::days(days_back);
                if let Some(start) = Local.with_ymd_and_hms(target_date.year(), target_date.month(), target_date.day(), 0, 0, 0).single() {
                    start_time = Some(start.timestamp_millis());
                    end_time = Some(start.timestamp_millis() + 86_400_000 - 1);
                    date_filter_label = Some(format!("Last {}", capitalize(name)));
                    break;
                }
            }
        }
    }

    // Clean stop words and natural language conversational phrases from query
    let mut cleaned = lower;
    let phrases_to_remove = [
        "this morning", "this afternoon", "tonight", "this evening",
        "yesterday", "today", "last few days", "past few days", "few days ago",
        "two weeks ago", "2 weeks ago", "last week", "past week", "this week",
        "last month", "past 30 days", "last monday", "last tuesday", "last wednesday",
        "last thursday", "last friday", "last saturday", "last sunday",
        "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
        "find that", "find the", "find", "show me", "look for", "that website about",
        "that article about", "that page about", "the website about", "the article about",
        "the page about", "that website", "that article", "that page", "website about",
        "article about", "page about", "i saw", "i opened", "i visited", "i read", "i looked at",
        "i was reading", "i was looking at", "something about", "website", "article", "page",
    ];

    for phrase in &phrases_to_remove {
        cleaned = cleaned.replace(phrase, " ");
    }

    // Tokenize into keywords
    let re = Regex::new(r"[a-zA-Z0-9_\-\.]+").unwrap();
    let stop_words: std::collections::HashSet<&str> = [
        "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with",
        "about", "from", "of", "by", "is", "was", "were", "it", "that", "this", "my",
        "me", "we", "you", "your", "into", "as", "at", "be",
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

fn capitalize(s: &str) -> String {
    let mut chars = s.chars();
    match chars.next() {
        None => String::new(),
        Some(f) => f.to_uppercase().collect::<String>() + chars.as_str(),
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
    } else if let Some(date_time) = Local.timestamp_millis_opt(timestamp_ms).single() {
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

pub fn search(
    db: &Database,
    semantic_engine: &SemanticEngine,
    query: &str,
    limit: usize,
) -> Result<Vec<MemoryItem>, String> {
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

    // 1. Keyword search via FTS5
    let fts_terms: Vec<String> = parsed
        .search_terms
        .iter()
        .map(|t| {
            let sanitized = t.replace('"', "");
            format!("\"{}\"*", sanitized)
        })
        .collect();
    let fts_query = fts_terms.join(" AND ");

    let mut candidate_items = match db.search_fts(&fts_query, parsed.start_time, parsed.end_time, limit * 3) {
        Ok(results) if !results.is_empty() => results,
        _ => {
            db.search_fallback_like(
                &parsed.search_terms,
                parsed.start_time,
                parsed.end_time,
                limit * 3,
            ).unwrap_or_default()
        }
    };

    // 2. Semantic Search Enhancement
    let query_embedding = semantic_engine.generate_embedding(trimmed);
    let mut semantic_scores: std::collections::HashMap<String, f32> = std::collections::HashMap::new();

    if let Some(ref q_vec) = query_embedding {
        // If candidate items are sparse, also pull items from DB embeddings to discover semantic matches
        if candidate_items.len() < limit * 2 {
            if let Ok(all_embs) = db.with_conn(|conn| semantic::get_all_embeddings(conn)) {
                let mut best_semantic: Vec<(String, f32)> = all_embs
                    .iter()
                    .map(|(id, emb)| {
                        let sim = SemanticEngine::cosine_similarity(q_vec, emb);
                        (id.clone(), sim)
                    })
                    .filter(|(_, sim)| *sim >= 0.40)
                    .collect();

                best_semantic.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

                for (id, sim) in best_semantic.iter().take(limit) {
                    semantic_scores.insert(id.clone(), *sim);
                    if !candidate_items.iter().any(|item| item.id == *id) {
                        if let Ok(Some(item)) = db.get_item_by_id(id) {
                            // Check date bounds if any
                            let matches_date = match (parsed.start_time, parsed.end_time) {
                                (Some(s), Some(e)) => item.last_visit_time >= s && item.last_visit_time <= e,
                                (Some(s), None) => item.last_visit_time >= s,
                                (None, Some(e)) => item.last_visit_time <= e,
                                (None, None) => true,
                            };
                            if matches_date {
                                candidate_items.push(item);
                            }
                        }
                    }
                }
            }
        }
    }

    // 3. Hybrid Ranking Strategy
    let query_lower = trimmed.to_lowercase();
    let now_ms = Local::now().timestamp_millis() as f64;

    let mut scored_items: Vec<(MemoryItem, f64)> = candidate_items
        .into_iter()
        .map(|mut item| {
            item.relative_time = Some(format_relative_time(item.last_visit_time));
            let title_lower = item.title.to_lowercase();
            let domain_lower = item.domain.to_lowercase();
            let url_lower = item.url.to_lowercase();

            let mut score = 0.0;

            // A. Exact & Partial Title Matches (Weight: 40%)
            if title_lower == query_lower {
                score += 160.0;
            } else if title_lower.contains(&query_lower) {
                score += 90.0;
            }

            // B. Domain Matches
            if domain_lower == query_lower || domain_lower.starts_with(&query_lower) {
                score += 80.0;
            } else if domain_lower.contains(&query_lower) {
                score += 50.0;
            }

            // C. Keyword Matches
            for term in &parsed.search_terms {
                let term_lower = term.to_lowercase();
                if title_lower.contains(&term_lower) {
                    score += 30.0;
                }
                if domain_lower.contains(&term_lower) {
                    score += 25.0;
                }
                if url_lower.contains(&term_lower) {
                    score += 15.0;
                }
            }

            // D. Semantic Similarity Bonus (Weight: 35%)
            if let Some(&sim) = semantic_scores.get(&item.id) {
                score += (sim as f64) * 120.0;
            }

            // E. Recency Decay (Weight: 15%)
            let age_hours = (now_ms - item.last_visit_time as f64) / 3_600_000.0;
            if age_hours < 12.0 {
                score += 30.0;
            } else if age_hours < 24.0 {
                score += 20.0;
            } else if age_hours < 72.0 {
                score += 12.0;
            } else if age_hours < 168.0 {
                score += 6.0;
            }

            // F. Visit Frequency Boost (Weight: 10%)
            score += (item.visit_count as f64).min(20.0) * 2.0;

            (item, score)
        })
        .collect();

    // Sort descending by hybrid score
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
    fn test_temporal_query_parsing() {
        let q_yesterday = parse_query("find that AI article I saw yesterday");
        assert!(q_yesterday.start_time.is_some());
        assert_eq!(q_yesterday.date_filter_label.as_deref(), Some("Yesterday"));
        assert!(q_yesterday.search_terms.contains(&"ai".to_string()));

        let q_today = parse_query("react authentication today");
        assert!(q_today.start_time.is_some());
        assert_eq!(q_today.date_filter_label.as_deref(), Some("Today"));
        assert!(q_today.search_terms.contains(&"react".to_string()));
        assert!(q_today.search_terms.contains(&"authentication".to_string()));

        let q_week = parse_query("github PR from last week");
        assert!(q_week.start_time.is_some());
        assert_eq!(q_week.date_filter_label.as_deref(), Some("Last 7 Days"));
        assert!(q_week.search_terms.contains(&"github".to_string()));
        assert!(q_week.search_terms.contains(&"pr".to_string()));

        let q_days = parse_query("something about electric cars few days ago");
        assert!(q_days.start_time.is_some());
        assert_eq!(q_days.date_filter_label.as_deref(), Some("Past Few Days"));
        assert!(q_days.search_terms.contains(&"electric".to_string()));
        assert!(q_days.search_terms.contains(&"cars".to_string()));
    }

    #[test]
    fn test_relative_time_formatting() {
        let now = Local::now().timestamp_millis();
        assert_eq!(format_relative_time(now - 10_000), "Just now");
        assert_eq!(format_relative_time(now - 300_000), "5m ago");
        assert_eq!(format_relative_time(now - 7_200_000), "2h ago");
    }

    #[test]
    fn test_cosine_similarity() {
        let v1 = vec![1.0, 0.0, 0.0];
        let v2 = vec![1.0, 0.0, 0.0];
        let sim = SemanticEngine::cosine_similarity(&v1, &v2);
        assert!((sim - 1.0).abs() < 1e-5);

        let v3 = vec![0.0, 1.0, 0.0];
        let sim_ortho = SemanticEngine::cosine_similarity(&v1, &v3);
        assert!(sim_ortho < 1e-5);
    }

    #[test]
    fn test_vector_serialization() {
        let orig = vec![0.123f32, -0.456, 0.789, 1.0];
        let bytes = SemanticEngine::serialize_embedding(&orig);
        let deserialized = SemanticEngine::deserialize_embedding(&bytes);
        assert_eq!(orig.len(), deserialized.len());
        for (a, b) in orig.iter().zip(deserialized.iter()) {
            assert!((a - b).abs() < 1e-6);
        }
    }

    #[test]
    fn test_semantic_conceptual_retrieval() {
        let engine = SemanticEngine::new();
        // Wait up to 10s for model init
        for _ in 0..20 {
            if engine.is_ready() {
                break;
            }
            std::thread::sleep(std::time::Duration::from_millis(500));
        }

        if engine.is_ready() {
            let emb_doc = engine.generate_embedding("Electric Vehicles, Battery Tech, and Clean Energy");
            let emb_query_related = engine.generate_embedding("automobile");
            let emb_query_unrelated = engine.generate_embedding("chocolate chip cookies recipe");

            assert!(emb_doc.is_some());
            assert!(emb_query_related.is_some());
            assert!(emb_query_unrelated.is_some());

            let doc_v = emb_doc.unwrap();
            let rel_v = emb_query_related.unwrap();
            let unrel_v = emb_query_unrelated.unwrap();

            let sim_related = SemanticEngine::cosine_similarity(&doc_v, &rel_v);
            let sim_unrelated = SemanticEngine::cosine_similarity(&doc_v, &unrel_v);

            println!("Semantic similarity related (EV vs automobile): {:.4}", sim_related);
            println!("Semantic similarity unrelated (EV vs cookie recipe): {:.4}", sim_unrelated);

            assert!(sim_related > sim_unrelated, "Conceptual match should score higher than unrelated query");
            assert!(sim_related > 0.35, "Related conceptual embeddings should have similarity > 0.35");
        }
    }
}

