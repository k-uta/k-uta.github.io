/******************************************************************************
 * @file    script.js
 * @author  Uta Kawakami
 * @date    13. Oct. 2024
 * Copyright (c) 2024-2026 Uta KAWAKAMI. All rights reserved.
 ******************************************************************************/

'use strict';

// ============================================================================
// Constants
// ============================================================================

/** Website 表示用カスタムフィールド（BibTeX コピー時に除去） */
const CUSTOM_FIELDS = [
    'category', 'dates', 'presentation', 'venue',
    'session', 'venue_type', 'video',
];

/** 月名→月番号の変換テーブル */
const MONTH_MAP = Object.freeze({
    jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
    apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
    aug: 8, august: 8, sep: 9, september: 9, oct: 10, october: 10,
    nov: 11, november: 11, dec: 12, december: 12,
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
    '7': 7, '8': 8, '9': 9, '10': 10, '11': 11, '12': 12,
});

/** GitHub リポジトリ名 */
const GITHUB_REPO = 'k-uta/k-uta.github.io';

/** publications.bib の生テキストキャッシュ */
let bibCache = null;

// ============================================================================
// DOM References (populated in init)
// ============================================================================

let elNavbar, elHamburger, elNavMenu, elBackToTop;

// ============================================================================
// Initialisation — single DOMContentLoaded
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Cache DOM elements ---
    elNavbar = document.getElementById('navbar');
    elHamburger = document.getElementById('hamburger');
    elNavMenu = document.getElementById('nav-menu');
    elBackToTop = document.getElementById('back-to-top');

    // --- Setup ---
    initNavigation();
    initSmoothScroll();
    initNewsAnchors();
    initScrollObserver();
    initBackToTop();
    initEmail();
    renderPublications();
    fetchLastCommitDate();
});

// ============================================================================
// Scroll — single listener for navbar + back-to-top
// ============================================================================

window.addEventListener('scroll', () => {
    const y = window.scrollY;

    // Navbar background on scroll
    if (elNavbar) {
        elNavbar.classList.toggle('scrolled', y > 50);
    }

    // Back-to-top visibility
    if (elBackToTop) {
        elBackToTop.style.display = y > 300 ? 'flex' : 'none';
    }
}, { passive: true });

// ============================================================================
// Navigation (hamburger)
// ============================================================================

function initNavigation() {
    if (!elHamburger || !elNavMenu) return;

    elHamburger.addEventListener('click', () => {
        const isActive = elHamburger.classList.toggle('active');
        elNavMenu.classList.toggle('active');
        elHamburger.setAttribute('aria-expanded', String(isActive));
    });

    // Close menu when any nav-link is clicked
    elNavMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            elHamburger.classList.remove('active');
            elNavMenu.classList.remove('active');
            elHamburger.setAttribute('aria-expanded', 'false');
        });
    });
}

// ============================================================================
// Smooth Scroll
// ============================================================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ============================================================================
// News → Related Section Jump
// ============================================================================

function initNewsAnchors() {
    document.querySelectorAll('.news-item[data-target]').forEach(item => {
        const selector = item.dataset.target;
        if (!selector) return;

        const handleJump = () => scrollToRelated(selector);

        item.addEventListener('click', handleJump);
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleJump();
            }
        });
    });
}

function scrollToRelated(selector) {
    const target = document.querySelector(selector);
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target.classList.add('target-highlight');
    setTimeout(() => target.classList.remove('target-highlight'), 1600);
}

// ============================================================================
// Scroll Reveal (Intersection Observer)
// ============================================================================

function initScrollObserver() {
    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            }
        },
        { rootMargin: '0px 0px -60px 0px', threshold: 0.1 },
    );

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ============================================================================
// Back to Top
// ============================================================================

function initBackToTop() {
    if (!elBackToTop) return;
    elBackToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================================================
// Email (anti-spam obfuscation)
// ============================================================================

function initEmail() {
    const el = document.getElementById('email');
    if (!el) return;

    const user = 'uta.kawakami';
    const domain = 'misc.mech.eng.osaka-u.ac.jp';
    const addr = `${user}@${domain}`;
    el.innerHTML = `<a href="mailto:${addr}"><i class="fas fa-envelope"></i> ${addr}</a>`;
}

// ============================================================================
// BibTeX Parser
// ============================================================================

/**
 * BibTeX テキストをパースしてエントリ配列を返す．
 * @param {string} text  .bib ファイルの中身
 * @returns {{ type: string, key: string, fields: Record<string, string> }[]}
 */
function parseBibTeX(text) {
    const entries = [];

    for (const raw of text.split(/(?=@\w+\{)/)) {
        const header = raw.match(/^@(\w+)\{([^,]+),/);
        if (!header) continue;

        const type = header[1].toLowerCase();
        const key = header[2].trim();
        const fields = {};
        const body = raw.substring(header[0].length);

        let i = 0;
        while (i < body.length) {
            // skip whitespace / commas
            while (i < body.length && /[\s,]/.test(body[i])) i++;
            if (i >= body.length || body[i] === '}') break;

            // field name
            let name = '';
            while (i < body.length && /[a-zA-Z_]/.test(body[i])) name += body[i++];
            if (!name) { i++; continue; }

            // skip '='
            while (i < body.length && /[\s=]/.test(body[i])) i++;

            // field value
            let value = '';
            if (body[i] === '{') {
                let depth = 0;
                i++;
                while (i < body.length) {
                    if (body[i] === '{') depth++;
                    else if (body[i] === '}') { if (depth === 0) { i++; break; } depth--; }
                    value += body[i++];
                }
            } else if (body[i] === '"') {
                i++;
                while (i < body.length && body[i] !== '"') value += body[i++];
                i++;
            } else {
                while (i < body.length && body[i] !== ',' && body[i] !== '}') value += body[i++];
            }

            fields[name.toLowerCase()] = value.trim();
        }

        entries.push({ type, key, fields });
    }

    return entries;
}

// ============================================================================
// Author Formatting
// ============================================================================

const RE_JAPANESE = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\uff00-\uffef]/;

/**
 * "and" 区切りの著者文字列を HTML に整形する．
 * 自分の名前 (Kawakami / 河上) は <u> で下線表示．
 */
function formatAuthors(authorStr) {
    const authors = authorStr.split(/\s+and\s+/).map(s => s.trim());
    const japanese = RE_JAPANESE.test(authorStr);

    if (japanese) {
        return authors
            .map(a => {
                const n = a.replace(/\s+/g, '');
                return n.includes('河上') ? `<u>${n}</u>` : n;
            })
            .join(', ');
    }

    const formatted = authors.map(a => {
        let first, last;
        if (a.includes(',')) {
            [last, first] = a.split(',').map(s => s.trim());
        } else {
            const parts = a.trim().split(/\s+/);
            last = parts.pop();
            first = parts.join(' ');
        }
        const initial = first ? `${first.charAt(0)}.` : '';
        const display = initial ? `${initial} ${last}` : last;
        return last.toLowerCase() === 'kawakami' ? `<u>${display}</u>` : display;
    });

    if (formatted.length <= 2) return formatted.join(', and ');
    return `${formatted.slice(0, -1).join(', ')}, and ${formatted.at(-1)}`;
}

// ============================================================================
// Entry Renderers
// ============================================================================

function capitalizeMonth(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
}

function renderPaperEntry({ fields: f }) {
    let html = `${formatAuthors(f.author)}, "${f.title}," <i>${f.journal}</i>`;
    if (f.volume) html += `, Vol.${f.volume}`;
    if (f.number?.trim()) html += `, No.${f.number}`;
    if (f.pages) html += `, pp. ${f.pages}`;
    html += f.month ? `, ${capitalizeMonth(f.month)}. ${f.year}` : `, ${f.year}`;
    return html;
}

function renderInternationalEntry({ fields: f }) {
    const venue = f.booktitle || f.journal;
    let html = `${formatAuthors(f.author)}, "${f.title}," <i>${venue}</i>`;
    if (f.dates) html += `, ${f.dates}`;
    if (f.presentation) html += ` (${f.presentation})`;
    return html;
}

function renderDomesticEntry({ fields: f }) {
    const venue = f.venue || f.booktitle || f.journal;
    let html = `${formatAuthors(f.author)}, "${f.title}," ${venue}`;
    if (f.session) html += `, ${f.session}`;
    if (f.dates) html += `, ${f.dates}`;
    if (f.venue_type) html += `, ${f.venue_type}`;
    return html;
}

/** カテゴリ → レンダラー */
const RENDERERS = {
    paper: renderPaperEntry,
    international: renderInternationalEntry,
    domestic: renderDomesticEntry,
};

// ============================================================================
// HTML Generation
// ============================================================================

function createCopyButton(key) {
    return '<div class="tooltip">'
        + `<img src="img/copy.png" alt="Click to copy BibTeX" class="copy-icon-img" data-bib-key="${key}">`
        + '<span class="tooltip-text">Click to copy BibTeX</span>'
        + '</div>';
}

function createEntryHTML(entry, category) {
    const renderer = RENDERERS[category];
    const textHTML = renderer ? renderer(entry) : '';
    const copyBtn = createCopyButton(entry.key);

    if (entry.fields.video) {
        return '<li>'
            + '<div class="publication-layout">'
            + `<div class="publication-text">${textHTML}${copyBtn}</div>`
            + '<div class="publication-video"><div class="video-container">'
            + `<iframe class="styled-iframe" width="560" height="315" src="${entry.fields.video}"`
            + ' title="YouTube video player" frameborder="0" loading="lazy"'
            + ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"'
            + ' referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
            + '</div></div>'
            + '</div>'
            + '</li>';
    }

    return `<li>${textHTML}${copyBtn}</li>`;
}

// ============================================================================
// Sorting
// ============================================================================

function getMonthNumber(str) {
    return str ? (MONTH_MAP[str.toLowerCase().trim()] || 0) : 0;
}

function sortByDate(entries) {
    return entries.sort((a, b) => {
        const dy = (parseInt(b.fields.year) || 0) - (parseInt(a.fields.year) || 0);
        return dy !== 0 ? dy : getMonthNumber(b.fields.month) - getMonthNumber(a.fields.month);
    });
}

// ============================================================================
// Publications — Main Render
// ============================================================================

async function fetchBib() {
    if (bibCache) return bibCache;
    const res = await fetch('publications.bib');
    bibCache = await res.text();
    return bibCache;
}

async function renderPublications() {
    try {
        const text = await fetchBib();
        const entries = parseBibTeX(text);

        // category フィールドがあるエントリのみ表示対象
        const groups = { book: [], paper: [], international: [], domestic: [] };
        for (const entry of entries) {
            const cat = entry.fields.category;
            if (cat && groups[cat]) groups[cat].push(entry);
        }

        // 各グループを日付降順ソート
        for (const cat of Object.keys(groups)) {
            groups[cat] = sortByDate(groups[cat]);
        }

        // DOM 更新 — 文字列を組み立ててから一括代入
        populateList('book-list', groups.book, 'count-book', 'book');
        populateList('paper', groups.paper, 'count-paper', 'paper');
        populateList('international-list', groups.international, 'count-international', 'international');
        populateList('domestic-list', groups.domestic, 'count-domestic', 'domestic');

        // イベント委譲: コピーボタン
        const pubSection = document.getElementById('publications');
        if (pubSection) pubSection.addEventListener('click', handleCopyClick);

    } catch (err) {
        console.error('Failed to load publications.bib:', err);
    }
}

/**
 * リスト要素に HTML を一括設定する．
 */
function populateList(listId, entries, countId, category) {
    const list = document.getElementById(listId);
    if (!list) return;

    const countEl = document.getElementById(countId);
    if (countEl) countEl.textContent = `${entries.length} 件`;

    if (entries.length === 0) {
        list.innerHTML = '<li>なし</li>';
        return;
    }

    list.innerHTML = entries.map(e => createEntryHTML(e, category)).join('');
}

// ============================================================================
// BibTeX Copy (event delegation)
// ============================================================================

function handleCopyClick(e) {
    const img = e.target.closest('[data-bib-key]');
    if (!img) return;
    copyBibtexFromBibFile(img.dataset.bibKey);
}

async function copyBibtexFromBibFile(key) {
    try {
        const text = await fetchBib();
        const entries = text.split(/(?=@\w+\{)/);
        const match = entries.find(entry => entry.includes(`{${key},`));

        if (!match) {
            console.warn('BibTeX entry not found:', key);
            return;
        }

        let cleaned = match.trim();
        for (const field of CUSTOM_FIELDS) {
            cleaned = cleaned.replace(
                new RegExp(`^\\s*${field}\\s*=\\s*\\{[^}]*\\},?\\s*\\n`, 'gm'), '',
            );
        }
        cleaned = cleaned.replace(/\n{3,}/g, '\n');

        await navigator.clipboard.writeText(cleaned.trim());
        showCopyToast();
    } catch (err) {
        console.error('Failed to copy BibTeX:', err);
    }
}

// ============================================================================
// Toast Notification (CSS-class based)
// ============================================================================

let toastTimer = null;

function showCopyToast() {
    let toast = document.getElementById('copy-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'copy-toast';
        toast.className = 'copy-toast';
        toast.textContent = '✓ BibTeX copied!';
        document.body.appendChild(toast);
    }

    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

// ============================================================================
// Last Updated (GitHub API)
// ============================================================================

async function fetchLastCommitDate() {
    try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=1`);
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) return;

        const date = new Date(data[0].commit.committer.date);
        const formatted = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0'),
        ].join('/');

        const el = document.getElementById('last-updated');
        if (el) el.textContent = `Last Updated: ${formatted}`;
    } catch (err) {
        console.error('Failed to fetch last commit date:', err);
    }
}
