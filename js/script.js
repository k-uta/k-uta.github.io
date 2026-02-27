/******************************************************************************
 * @file    script.js
 * @auther  Uta Kawakami
 * @date    13. Oct. 2024
 * Copyright (c) 2024 Uta KAWAKAMI. All rights reserved.
 ******************************************************************************/

// ページのトップにスクロールする関数
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// スクロール位置に応じてボタンの表示を切り替える
window.onscroll = function () {
    var backToTopButton = document.getElementById('back-to-top');
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        backToTopButton.style.display = "block";
    } else {
        backToTopButton.style.display = "none";
    }
}

// スムーズスクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// ============================================================================
// BibTeX Parser
// ============================================================================

/**
 * BibTeXファイルをパースしてエントリオブジェクトの配列を返す
 * 各エントリ: { type, key, fields: { fieldName: fieldValue, ... } }
 */
function parseBibTeX(text) {
    const entries = [];
    const rawEntries = text.split(/(?=@\w+\{)/);

    for (const raw of rawEntries) {
        const headerMatch = raw.match(/^@(\w+)\{([^,]+),/);
        if (!headerMatch) continue;

        const type = headerMatch[1].toLowerCase();
        const key = headerMatch[2].trim();
        const fields = {};
        const content = raw.substring(headerMatch[0].length);

        let i = 0;
        while (i < content.length) {
            while (i < content.length && /[\s,]/.test(content[i])) i++;
            if (i >= content.length || content[i] === '}') break;

            let fieldName = '';
            while (i < content.length && /[a-zA-Z_]/.test(content[i])) {
                fieldName += content[i];
                i++;
            }
            if (!fieldName) { i++; continue; }

            while (i < content.length && /[\s=]/.test(content[i])) i++;

            let value = '';
            if (content[i] === '{') {
                let depth = 0;
                i++;
                while (i < content.length) {
                    if (content[i] === '{') depth++;
                    else if (content[i] === '}') {
                        if (depth === 0) { i++; break; }
                        depth--;
                    }
                    value += content[i];
                    i++;
                }
            } else if (content[i] === '"') {
                i++;
                while (i < content.length && content[i] !== '"') {
                    value += content[i];
                    i++;
                }
                i++;
            } else {
                while (i < content.length && content[i] !== ',' && content[i] !== '}') {
                    value += content[i];
                    i++;
                }
            }

            fields[fieldName.toLowerCase()] = value.trim();
        }

        entries.push({ type, key, fields });
    }

    return entries;
}

// ============================================================================
// 著者名フォーマット
// ============================================================================

function isJapaneseText(text) {
    return /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\uff00-\uffef]/.test(text);
}

function formatAuthors(authorStr) {
    const authors = authorStr.split(/\s+and\s+/).map(a => a.trim());
    const japanese = isJapaneseText(authorStr);

    if (japanese) {
        const formatted = authors.map(a => {
            const name = a.replace(/\s+/g, '');
            return name.includes('河上') ? `<u>${name}</u>` : name;
        });
        return formatted.join(', ');
    } else {
        const formatted = authors.map(a => {
            let first, last;
            if (a.includes(',')) {
                const parts = a.split(',').map(s => s.trim());
                last = parts[0];
                first = parts[1];
            } else {
                const parts = a.trim().split(/\s+/);
                last = parts[parts.length - 1];
                first = parts.slice(0, -1).join(' ');
            }
            const initial = first ? first.charAt(0) + '.' : '';
            const isOwner = last.toLowerCase() === 'kawakami';
            const display = initial ? `${initial} ${last}` : last;
            return isOwner ? `<u>${display}</u>` : display;
        });

        if (formatted.length === 1) return formatted[0];
        if (formatted.length === 2) return `${formatted[0]}, and ${formatted[1]}`;
        return formatted.slice(0, -1).join(', ') + ', and ' + formatted[formatted.length - 1];
    }
}

// ============================================================================
// エントリ表示フォーマット
// ============================================================================

function capitalizeMonth(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function renderPaperEntry(entry) {
    const f = entry.fields;
    const authors = formatAuthors(f.author);
    let html = `${authors}, "${f.title}," <i>${f.journal}</i>`;
    if (f.volume) html += `, Vol.${f.volume}`;
    if (f.number && f.number.trim()) html += `, No.${f.number}`;
    if (f.pages) html += `, pp. ${f.pages}`;
    if (f.month) {
        html += `, ${capitalizeMonth(f.month)}. ${f.year}`;
    } else {
        html += `, ${f.year}`;
    }
    return html;
}

function renderInternationalEntry(entry) {
    const f = entry.fields;
    const authors = formatAuthors(f.author);
    const venue = f.booktitle || f.journal;
    let html = `${authors}, "${f.title}," <i>${venue}</i>`;
    if (f.dates) html += `, ${f.dates}`;
    if (f.presentation) html += ` (${f.presentation})`;
    return html;
}

function renderDomesticEntry(entry) {
    const f = entry.fields;
    const authors = formatAuthors(f.author);
    const venue = f.venue || f.booktitle || f.journal;
    let html = `${authors}, "${f.title}," ${venue}`;
    if (f.session) html += `, ${f.session}`;
    if (f.dates) html += `, ${f.dates}`;
    if (f.venue_type) html += `, ${f.venue_type}`;
    return html;
}

// ============================================================================
// HTML生成
// ============================================================================

function createCopyButton(key) {
    return `<div class="tooltip">
        <img src="img/copy.png" alt="Click to copy BibTeX" class="copy-icon-img"
            onclick="copyBibtexFromBibFile('${key}')">
        <span class="tooltip-text">Click to copy BibTeX</span>
    </div>`;
}

function createEntryHTML(entry, category) {
    const f = entry.fields;
    let textHTML = '';

    switch (category) {
        case 'paper':
            textHTML = renderPaperEntry(entry);
            break;
        case 'international':
            textHTML = renderInternationalEntry(entry);
            break;
        case 'domestic':
            textHTML = renderDomesticEntry(entry);
            break;
    }

    const copyBtn = createCopyButton(entry.key);

    if (f.video) {
        return `<li>
            <div class="publication-layout">
                <div class="publication-text">
                    ${textHTML}
                    ${copyBtn}
                </div>
                <div class="publication-video">
                    <div class="video-container">
                        <iframe class="styled-iframe" width="560" height="315"
                            src="${f.video}"
                            title="YouTube video player" frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                    </div>
                </div>
            </div>
        </li>`;
    }

    return `<li>${textHTML}${copyBtn}</li>`;
}

// ============================================================================
// ソート
// ============================================================================

const MONTH_MAP = {
    jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
    apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
    aug: 8, august: 8, sep: 9, september: 9, oct: 10, october: 10,
    nov: 11, november: 11, dec: 12, december: 12,
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
    '7': 7, '8': 8, '9': 9, '10': 10, '11': 11, '12': 12
};

function getMonthNumber(monthStr) {
    if (!monthStr) return 0;
    return MONTH_MAP[monthStr.toLowerCase().trim()] || 0;
}

function sortEntries(entries) {
    return entries.sort((a, b) => {
        const yearDiff = (parseInt(b.fields.year) || 0) - (parseInt(a.fields.year) || 0);
        if (yearDiff !== 0) return yearDiff;
        return getMonthNumber(b.fields.month) - getMonthNumber(a.fields.month);
    });
}

// ============================================================================
// メイン描画処理
// ============================================================================

// Website表示用のカスタムフィールド（BibTeXコピー時に除去する）
const CUSTOM_FIELDS = ['category', 'dates', 'presentation', 'venue', 'session', 'venue_type', 'video'];

function renderPublications() {
    fetch('publications.bib')
        .then(response => response.text())
        .then(text => {
            const entries = parseBibTeX(text);

            // category フィールドがあるエントリのみ表示対象
            const displayEntries = entries.filter(e => e.fields.category);

            // カテゴリ別にグループ化
            const groups = { book: [], paper: [], international: [], domestic: [] };
            for (const entry of displayEntries) {
                const cat = entry.fields.category;
                if (groups[cat]) groups[cat].push(entry);
            }

            // 各グループを年・月でソート（降順）
            for (const cat in groups) {
                groups[cat] = sortEntries(groups[cat]);
            }

            // 著書
            const bookContainer = document.getElementById('book').parentElement;
            if (groups.book.length === 0) {
                bookContainer.innerHTML = '<li>なし</li>';
            } else {
                bookContainer.innerHTML = '';
                for (const entry of groups.book) {
                    bookContainer.innerHTML += createEntryHTML(entry, 'book');
                }
            }
            document.getElementById('count-book').textContent = groups.book.length + ' 件';

            // 論文
            const paperList = document.getElementById('paper');
            paperList.innerHTML = '';
            for (const entry of groups.paper) {
                paperList.innerHTML += createEntryHTML(entry, 'paper');
            }
            document.getElementById('count-paper').textContent = groups.paper.length + ' 件';

            // 国際学会
            const intlList = document.getElementById('international-list');
            intlList.innerHTML = '';
            for (const entry of groups.international) {
                intlList.innerHTML += createEntryHTML(entry, 'international');
            }
            document.getElementById('count-international').textContent = groups.international.length + ' 件';

            // 国内学会
            const domList = document.getElementById('domestic-list');
            domList.innerHTML = '';
            for (const entry of groups.domestic) {
                domList.innerHTML += createEntryHTML(entry, 'domestic');
            }
            document.getElementById('count-domestic').textContent = groups.domestic.length + ' 件';
        })
        .catch(err => {
            console.error('Failed to load publications.bib:', err);
        });
}

// ============================================================================
// BibTeXコピー（カスタムフィールドを除去してコピー）
// ============================================================================

function copyBibtexFromBibFile(key) {
    fetch('publications.bib')
        .then(response => response.text())
        .then(text => {
            const entries = text.split(/(?=@\w+\{)/);
            const match = entries.find(entry => entry.includes(`{${key},`));

            if (match) {
                let cleaned = match.trim();
                for (const field of CUSTOM_FIELDS) {
                    cleaned = cleaned.replace(
                        new RegExp(`^\\s*${field}\\s*=\\s*\\{[^}]*\\},?\\s*\\n`, 'gm'),
                        ''
                    );
                }
                cleaned = cleaned.replace(/\n{3,}/g, '\n');

                navigator.clipboard.writeText(cleaned.trim()).then(() => {
                    alert("BibTeX copied to clipboard!");
                });
            } else {
                alert("BibTeX entry not found for: " + key);
            }
        })
        .catch(err => {
            alert("Failed to load publications.bib: " + err);
        });
}

// ============================================================================
// 初期化
// ============================================================================

document.addEventListener("DOMContentLoaded", function () {
    // メールアドレスの設定（スパム対策）
    var user = "uta.kawakami";
    var domain = "uec.ac.jp";
    var email = user + "@" + domain;
    var emailElement = document.getElementById("email");
    emailElement.innerHTML = '<a href="mailto:' + email + '">' + email + '</a>';

    // BibTeXから研究業績を読み込み・表示
    renderPublications();

    // GitHub APIから最終コミット日を取得して表示
    fetchLastCommitDate();
});

// ============================================================================
// 最終更新日（GitHub API）
// ============================================================================

function fetchLastCommitDate() {
    const repo = 'k-uta/k-uta.github.io';
    fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const date = new Date(data[0].commit.committer.date);
                const formatted = date.getFullYear() + '/' +
                    String(date.getMonth() + 1).padStart(2, '0') + '/' +
                    String(date.getDate()).padStart(2, '0');
                const el = document.getElementById('last-updated');
                if (el) el.textContent = 'Last Updated: ' + formatted;
            }
        })
        .catch(err => {
            console.error('Failed to fetch last commit date:', err);
        });
}
