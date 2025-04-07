/******************************************************************************
 * @file    script.js
 * @auther  Uta Kawakami
 * @date    13. Oct. 2024
 * Copyright (c) 2024 Uta KAWAKAMI. All rights reserved.
 ******************************************************************************/
function toggleLanguage() {
    const elements = {
        name: {
            ja: "河上 響/ Uta Kawakami",
            en: "河上 響/ Uta Kawakami"
        },
        affiliation: [
            {
                ja: "電気通信大学 情報理工学研究科 機械知能システム学専攻 博士前期課程 (2024-)",
                en: "The University of Electro-Communications, Graduate School of Information Science and Technology, Department of Mechanical Intelligence Systems, Master's Program (2024-)"
            },
            {
                ja: '<a href="https://ooedo.tech/">OOEDO SAMURAI</a> RoboMaster Project ソフト班・会計 (2022-)',
                en: '<a href="https://ooedo.tech/">OOEDO SAMURAI</a> RoboMaster Project Software Section & Accounting (2022-)'
            }
        ],
        education: [
            {
                ja: "香川高等専門学校 電子システム工学科 卒業 (2022)",
                en: "National Institute of Technology, Kagawa College, Department of Electronic Systems Engineering, Graduated (2022)"
            },
            {
                ja: "電気通信大学 情報理工学域Ⅱ類 計測・制御システムプログラム 卒業 (2024)",
                en: "The University of Electro-Communications, School of Informatics and Engineering, Cluster II (Emerging Multi-Interdisciplinary Engineering), Measurement and Control Systems Program, Graduated (2024)"
            }],
        book: {
            ja: "なし",
            en: "None"
        },
        originalPaper: {
            ja: "なし",
            en: "None"
        },
        misc: [
            {
                ja: "岩本直也，三崎幸典，武智大河・尾崎玲音・河上響・林文博・福田和秀：点検ロボットと物体検出モデルを用いた架空地線の異常検出，令和2年電気学会全国大会講演論文集2020，2020.03.01",
                en: "Naoya Iwamoto, Yukinori Misaki, Taiga Takechi, Reon Ozaki, Uta Kawakami, Fumihiro Hayashi, Kazuhide Fukuta: Detection of anomalies in overhead ground wires using an inspection robot and object detection model, Proceedings of the 2020 National Conference of the Institute of Electrical Engineers of Japan, 2020.03.01"
            },
            {
                ja: "岩本直也，須藤陽輝，河上響，尾崎玲音，三﨑幸典：深層学習を用いた送電線の異常検出手法の検討，電気学会電力・エネルギー部門大会論文集2019，2019.08.23",
                en: "Naoya Iwamoto, Haruki Sudo, Uta Kawakami, Reon Ozaki, Yukinori Misaki: Study on anomaly detection method of transmission lines using deep learning, Proceedings of the 2019 Power and Energy Society General Meeting, 2019.08.23"
            }
        ],
        international: [
            {
                ja: "〇N. Iwamoto, Y. Misaki, T. Takechi, R. Ozaki, U. Kawakami, F. Hayashi, K. Fukuta：A Power Transmission Line Inspection Robot and An AI-Based Anomaly Detection System，2019 IEEE International Workshop on Future Computing，2019.12.16，対面開催",
                en: "〇Naoya Iwamoto, Yukinori Misaki, Taiga Takechi, Reon Ozaki, Uta Kawakami, Fumihiro Hayashi, Kazuhide Fukuta: A Power Transmission Line Inspection Robot and An AI-Based Anomaly Detection System, 2019 IEEE International Workshop on Future Computing, 2019.12.16, In-Person"
            },
            {
                ja: "〇Uta Kawakami, Kenji Sawada: Steering Control Considering Motion Sickness and Vehicle Performance via DDPG Algorithm and 6-DoF-SVC Model, IEEE International Conference on Systems, Man, and Cybernetics, 6-10, Oct. 2024 (In-person, Poster, Full Paper Review)",
                en: "〇Uta Kawakami, Kenji Sawada: Steering Control Considering Motion Sickness and Vehicle Performance via DDPG Algorithm and 6-DoF-SVC Model, IEEE International Conference on Systems, Man, and Cybernetics, 6-10, Oct. 2024 (In-person, Poster, Full Paper Review)"
            }
        ],
        domestic: [
            {
                ja: "〇河上響，澤田賢治：強化学習を用いた速度計画生成アルゴリズムの動揺病および車両性能の評価，計測自動制御学会 第11回制御部門マルチシンポジウム，3M6-4，2024.03.17-20，対面開催",
                en: "〇Uta Kawakami, Kenji Sawada: Evaluation of Motion Sickness and Vehicle Performance in Speed Planning Generation Algorithm using Reinforcement Learning, The 11th Multi-Symposium on Control Systems, 3M6-4, 2024.03.17-20, In-Person"
            },
            {
                ja: "〇河上響，澤⽥賢治：強化学習を⽤いた燃費および乗り⼼地の改善 ，2023年度計測自動制御学会関西支部・システム制御情報学会シンポジウム，C1-2，2024.01.12，対面開催",
                en: "〇Uta Kawakami, Kenji Sawada: Improvement of Fuel Efficiency and Ride Comfort using Reinforcement Learning, The 2023 Kansai Branch of the Society of Instrument and Control Engineers and the Systems and Information Society Symposium, C1-2, 2024.01.12, In-Person"
            },
            {
                ja: "河上響，〇村上和也，菅哲朗，小泉直也，新竹純：視覚刺激と触覚刺激による感情制御の実現可能性の研究，ロボティクス・メカトロニクス講演会2023，2A1-I05，2023.06.28-07.01",
                en: "Uta Kawakami, 〇Kazuya Murakami, Tetsuro Suga, Naoya Koizumi, Jun Aratake: Study on the Feasibility of Emotion Control using Visual and Haptic Stimulation, Robotics and Mechatronics Conference 2023, 2A1-I05, 2023.06.28-07.01"
            },
            {
                ja: "〇陶國多聞，境直人，河上響，尾崎玲音，伊藤翼，岩本直也，三﨑幸典，秋月拓磨，日根恭子，中内茂樹：深層学習を用いた果物・野菜小型選果装置の実用化，2021年度先進的技術シンポジウム，課題番号3103，2022.03.08，遠隔開催",
                en: "〇Tamon Suekui, Naoto Sakai, Uta Kawakami, Reon Ozaki, Tsubasa Ito, Naoya Iwamoto, Yukinori Misaki, Takuma Akizuki, Kyoko Hine, Shigeki Nakauchi: Practical Application of a Small Fruit and Vegetable Sorting Device using Deep Learning, 2021 Advanced Technology Symposium, Project No. 3103, 2022.03.08, Online"
            }
        ],
        awards: [
            {
                ja: "全国高等専門学校ディープラーニングコンテスト2019 準優勝・企業評価額3億円(2019年04月)",
                en: "National College of Technology Deep Learning Contest 2019 Runner-up and Corporate Evaluation of 300 Million Yen (April 2019)"
            },
            {
                ja: "第32回アイデア対決・全国高等専門学校ロボットコンテスト2019全国大会 優勝・内閣総理大臣賞(2019年11月)",
                en: "32nd Idea Battle National College of Technology Robot Contest 2019 National Tournament Winner and Prime Minister's Award (November 2019)"
            },
            {
                ja: "第34回アイデア対決・全国高等専門学校ロボットコンテスト2019全国大会 アイデア賞 (2021年11月)",
                en: "34th Idea Battle National College of Technology Robot Contest 2021 National Tournament Idea Award (November 2021)"
            }
        ],
        vehicle: [
            {
                ja: "車: なし",
                en: "Car: None"
            },
            {
                ja: "バイク: HONDA CBR250R Special Edition (2016年モデル)，YAMAHA YB125SP (2016年モデル)",
                en: "Motorcycle: HONDA CBR250R Special Edition (2016 model), YAMAHA YB125SP (2016 model)"
            },
            {
                ja: "自転車: GIANT Escape R Disk",
                en: "Bicycle: GIANT Escape R Disk"
            }
        ]
    };

    const currentLanguage = document.documentElement.lang === 'ja' ? 'ja' : 'en';
    const newLanguage = currentLanguage === 'ja' ? 'en' : 'ja';

    document.getElementById('name').innerText = elements.name[newLanguage];
    document.getElementById('affiliation-1').innerHTML = elements.affiliation[0][newLanguage];
    document.getElementById('affiliation-2').innerHTML = elements.affiliation[1][newLanguage];
    document.getElementById('education-1').innerText = elements.education[0][newLanguage];
    document.getElementById('education-2').innerText = elements.education[1][newLanguage];
    document.getElementById('book').innerText = elements.book[newLanguage];
    document.getElementById('original-paper').innerText = elements.originalPaper[newLanguage];
    document.getElementById('misc-1').innerText = elements.misc[0][newLanguage];
    document.getElementById('misc-2').innerText = elements.misc[1][newLanguage];
    document.getElementById('international-1').innerText = elements.international[0][newLanguage];
    document.getElementById('domestic-1').innerText = elements.domestic[0][newLanguage];
    document.getElementById('domestic-2').innerText = elements.domestic[1][newLanguage];
    document.getElementById('domestic-3').innerText = elements.domestic[2][newLanguage];
    document.getElementById('domestic-4').innerText = elements.domestic[3][newLanguage];
    document.getElementById('award-1').innerText = elements.awards[0][newLanguage];
    document.getElementById('award-2').innerText = elements.awards[1][newLanguage];
    document.getElementById('award-3').innerText = elements.awards[2][newLanguage];
    document.documentElement.lang = newLanguage;
}

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