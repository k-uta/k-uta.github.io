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

document.addEventListener("DOMContentLoaded", function () {
    var user = "uta.kawakami";
    var domain = "uec.ac.jp";
    var email = user + "@" + domain;
    var emailElement = document.getElementById("email");
    emailElement.innerHTML = '<a href="mailto:' + email + '">' + email + '</a>';
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

window.addEventListener('DOMContentLoaded', () => {
    // 著書の件数（"なし"なら0とする）
    const bookList = document.querySelectorAll('#book');
    const bookCount = (bookList.length === 1 && bookList[0].textContent.trim() === 'なし') ? 0 : bookList.length;
    document.getElementById('count-book').textContent = bookCount + ' 件';

    // 論文・国際・国内の件数（すべて「 件」を付加）
    document.getElementById('count-paper').textContent =
        document.querySelectorAll('#paper li').length + ' 件';

    document.getElementById('count-international').textContent =
        document.querySelectorAll('#international-list li').length + ' 件';

    document.getElementById('count-domestic').textContent =
        document.querySelectorAll('#domestic-list li').length + ' 件';
});

function copyBibtexFromBibFile(key) {
    fetch('publications.bib')
        .then(response => response.text())
        .then(text => {
            // 正規表現の改良版：次の @ で終わるように調整
            const regex = new RegExp(`@\\w+\\{${key},[\\s\\S]*?\\n\\}`, 'g'); // ←ここを修正
            const entries = text.split(/(?=@\w+\{)/); // すべてのエントリで分割
            const match = entries.find(entry => entry.includes(`{${key},`));

            if (match) {
                navigator.clipboard.writeText(match.trim()).then(() => {
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
