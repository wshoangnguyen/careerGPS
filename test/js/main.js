// main.js - Hỗ trợ DISC và MBTI với màn hình nhập thông tin

const App = {
    // State
    currentScreen: 'info', // 'info', 'test', 'result'
    selectedTest: null,    // 'disc' or 'mbti'
    userInfo: {
        fullName: '',
        phone: '',
        email: ''
    },
    currentTestData: null,
    userAnswers: {},
    testResult: null,
    
    // Constants
    testFiles: {
        disc: 'data/DISCquestions.json',
        mbti: 'data/MBTI.json'
    },
    
    init: async function() {
        this.bindEvents();
        // Preload test data?
    },
    
    bindEvents: function() {
        // Form inputs
        document.getElementById('fullName')?.addEventListener('input', (e) => {
            this.userInfo.fullName = e.target.value;
            this.checkStartButton();
        });
        document.getElementById('email')?.addEventListener('input', (e) => {
            this.userInfo.email = e.target.value;
            this.checkStartButton();
        });
        document.getElementById('phone')?.addEventListener('input', (e) => {
            this.userInfo.phone = e.target.value;
        });
        
        // Test selection
        document.querySelectorAll('.test-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.test-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedTest = card.dataset.test;
                this.checkStartButton();
            });
        });
        
        // Start test button
        document.getElementById('startTestBtn')?.addEventListener('click', () => {
            this.startTest();
        });
        
        // Back button
        document.getElementById('backToInfoBtn')?.addEventListener('click', () => {
            this.showScreen('info');
        });
    },
    
    checkStartButton: function() {
        const btn = document.getElementById('startTestBtn');
        if (btn) {
            const isValid = this.userInfo.fullName.trim() !== '' && 
                           this.userInfo.email.trim() !== '' && 
                           this.selectedTest !== null;
            btn.disabled = !isValid;
        }
    },
    
    startTest: async function() {
        if (!this.selectedTest) return;
        
        // Show loading
        this.showLoading(true);
        
        try {
            // Load test data
            const response = await fetch(this.testFiles[this.selectedTest]);
            if (!response.ok) throw new Error('Không thể tải test');
            this.currentTestData = await response.json();
            this.userAnswers = {};
            
            // Render test
            this.renderTest();
            this.showScreen('test');
        } catch (error) {
            alert('Lỗi tải dữ liệu: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    },
    
    renderTest: function() {
        const container = document.getElementById('testContent');
        if (!this.currentTestData) return;
        
        const questions = this.currentTestData.questions;
        const isMBTI = this.selectedTest === 'mbti';
        
        document.getElementById('testTitle').innerHTML = this.currentTestData.title || 
            (isMBTI ? '🧩 Bài test MBTI' : '🎯 Bài test DISC');
        
        let html = `<form id="testForm">`;
        
        questions.forEach((q, idx) => {
            if (isMBTI) {
                // MBTI format
                html += `
                    <div class="question-card" data-qid="${q.id}">
                        <div class="question-header">
                            <span class="question-number">Câu ${idx + 1}/${questions.length}</span>
                        
                        <div class="question-text">${q.text}</div>
                        </div>
                        <div class="mbti-options" data-qid="${q.id}" data-dimension="${q.dimension}">
                            <div class="mbti-option" data-value="0">${q.options[0]}</div>
                            <div class="mbti-option" data-value="1">${q.options[1]}</div>
                        </div>
                    </div>
                `;
            } else {
                // DISC format (Likert scale)
                html += `
                    <div class="question-card" data-qid="${q.id}">
                        <div class="question-header">
                            <span class="question-number">Câu ${idx + 1}/${questions.length}</span>
                        
                        <div class="question-text">${q.text}</div>
                        </div>
                        <div class="likert-scale">
                            ${[1,2,3,4,5].map(score => `
                                <div class="likert-option">
                                    <input type="radio" name="q${q.id}" value="${score}" id="q${q.id}_${score}">
                                    <label for="q${q.id}_${score}">${score}</label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        });
        
        html += `
            <div class="btn-group">
                <button type="button" class="btn btn-secondary" id="resetTestBtn">🔄 Xóa tất cả</button>
                <button type="button" class="btn btn-primary" id="submitTestBtn">✅ Phân tích</button>
            </div>
        </form>`;
        
        container.innerHTML = html;
        
        // Bind events cho test
        if (isMBTI) {
            this.bindMBTIEvents();
        } else {
            this.bindDISCEvents();
        }
        
        document.getElementById('resetTestBtn')?.addEventListener('click', () => this.resetTest());
        document.getElementById('submitTestBtn')?.addEventListener('click', () => this.submitTest());
    },
    
    bindDISCEvents: function() {
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const match = e.target.name.match(/q(\d+)/);
                if (match) {
                    this.userAnswers[match[1]] = parseInt(e.target.value);
                }
            });
        });
        
        // Restore answers if any
        if (Object.keys(this.userAnswers).length > 0) {
            for (const [qid, val] of Object.entries(this.userAnswers)) {
                const radio = document.querySelector(`input[name="q${qid}"][value="${val}"]`);
                if (radio) radio.checked = true;
            }
        }
    },
    
    bindMBTIEvents: function() {
        document.querySelectorAll('.mbti-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                const parent = opt.closest('.mbti-options');
                const qid = parent.dataset.qid;
                const dimension = parent.dataset.dimension;
                const value = opt.dataset.value;
                
                // Remove selected class from siblings
                parent.querySelectorAll('.mbti-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                
                this.userAnswers[qid] = {
                    value: parseInt(value),
                    dimension: dimension
                };
            });
        });
        
        // Restore answers
        if (Object.keys(this.userAnswers).length > 0) {
            for (const [qid, answer] of Object.entries(this.userAnswers)) {
                const option = document.querySelector(`.mbti-options[data-qid="${qid}"] .mbti-option[data-value="${answer.value}"]`);
                if (option) option.classList.add('selected');
            }
        }
    },
    
    resetTest: function() {
        if (confirm('Bạn có chắc muốn xóa tất cả câu trả lời?')) {
            this.userAnswers = {};
            if (this.selectedTest === 'mbti') {
                document.querySelectorAll('.mbti-option').forEach(opt => opt.classList.remove('selected'));
            } else {
                document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
            }
        }
    },
    
submitTest: function() {
    const totalQuestions = this.currentTestData.questions.length;
    const answered = Object.keys(this.userAnswers).length;
    
    if (answered < totalQuestions) {
        alert(`⚠️ Bạn mới trả lời ${answered}/${totalQuestions} câu. Vui lòng hoàn thành tất cả.`);
        return;
    }
    
    // === THÊM LOADING ===
    this.showLoadingOverlay(true); // Hiện loading
    
    // Giả lập xử lý (có thể tính toán kết quả trước)
    setTimeout(async () => {
        // Tính kết quả
        if (this.selectedTest === 'mbti') {
            this.calculateMBTIResult();
        } else {
            this.calculateDISCResult();
        }
        
        // === LƯU NGAY VÀO GOOGLE SHEET ===
        await this.saveResultToGoogleSheet();
        
        // Ẩn loading
        this.showLoadingOverlay(false);
        
        // Hiển thị kết quả (vẫn để người dùng xem)
        // this.showResult() đã được gọi bên trong calculateXXXResult
    }, 300);
},

saveResultToGoogleSheet: async function() {
    // Lấy kết quả từ DOM hoặc từ biến đã lưu
    let mainResult = '', detailScores = '', rawData = {};
    
    if (this.selectedTest === 'disc') {
        const primaryTypeElem = document.querySelector('.result-description h3 span');
        mainResult = primaryTypeElem ? primaryTypeElem.innerText : 'DISC Result';
        detailScores = document.querySelector('.result-description ul')?.innerText || '';
        rawData = this.lastDiscScores || {};
    } else {
        const mbtiElem = document.querySelector('.result-card h2 + div div');
        mainResult = mbtiElem ? mbtiElem.innerText : 'MBTI Result';
        detailScores = document.querySelector('.result-description ul')?.innerText || '';
        rawData = { mbtiType: mainResult };
    }
    
    const payload = {
        fullName: this.userInfo.fullName,
        email: this.userInfo.email,
        phone: this.userInfo.phone,
        testType: this.selectedTest === 'disc' ? 'DISC' : 'MBTI',
        mainResult: mainResult,
        detailScores: detailScores,
        rawData: rawData,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
    };
    
    try {
        await fetch(this.googleScriptURL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log('✅ Xong');
        // Không alert ở đây nữa để tránh làm phiền
    } catch(error) {
        console.error('Lỗi khi lưu:', error);
    }
},

showLoadingOverlay: function(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
},
    
    calculateDISCResult: function() {
        const scores = { D: 0, I: 0, S: 0, C: 0 };
        const counts = { D: 0, I: 0, S: 0, C: 0 };
        
        this.currentTestData.questions.forEach(q => {
            const answer = this.userAnswers[q.id];
            if (answer) {
                scores[q.type] += answer;
                counts[q.type]++;
            }
        });
        
        const normalized = {};
        for (let type of ['D', 'I', 'S', 'C']) {
            if (counts[type] > 0) {
                normalized[type] = Math.round((scores[type] / counts[type]) * 6);
            } else {
                normalized[type] = 0;
            }
        }
        
        this.lastDiscScores = scores;  // Lưu lại để dùng sau
        this.displayDISCResult(scores);
        this.displayDISCResult(normalized);
    },
    
    calculateMBTIResult: function() {
        const dimensions = {
            EI: 0,  // <0 hướng E, >0 hướng I
            SN: 0,
            TF: 0,
            JP: 0
        };
        
        for (const [qid, answer] of Object.entries(this.userAnswers)) {
            const question = this.currentTestData.questions.find(q => q.id == qid);
            if (question) {
                const dim = question.dimension;
                // value 0 = option đầu (E, S, T, J), value 1 = option sau (I, N, F, P)
                if (answer.value === 0) {
                    dimensions[dim]--;
                } else {
                    dimensions[dim]++;
                }
            }
        }
        
        const result = {
            EI: dimensions.EI <= 0 ? 'E' : 'I',
            SN: dimensions.SN <= 0 ? 'S' : 'N',
            TF: dimensions.TF <= 0 ? 'T' : 'F',
            JP: dimensions.JP <= 0 ? 'J' : 'P'
        };
        
        const mbtiType = result.EI + result.SN + result.TF + result.JP;
        this.displayMBTIResult(mbtiType, dimensions);
    },
    
    displayDISCResult: function(scores) {
        const sorted = Object.entries(scores).sort((a,b) => b[1] - a[1]);
        const primaryType = sorted[0][0];
        
        const descriptions = {
            D: { name: 'Dominance (Thống trị)', desc: 'Bạn là người quyết đoán, thích thử thách và kiểm soát. Phù hợp với vai trò lãnh đạo, giải quyết khủng hoảng.' },
            I: { name: 'Influence (Ảnh hưởng)', desc: 'Bạn là người hòa đồng, nhiệt tình, truyền cảm hứng. Phù hợp với bán hàng, truyền thông, team building.' },
            S: { name: 'Steadiness (Kiên định)', desc: 'Bạn là người điềm tĩnh, kiên nhẫn, trung thành. Phù hợp với hỗ trợ, chăm sóc khách hàng.' },
            C: { name: 'Conscientiousness (Tuân thủ)', desc: 'Bạn là người cẩn thận, chính xác, logic. Phù hợp với kiểm soát chất lượng, kế toán, nghiên cứu.' }
        };
        
        let chartHtml = `<div class="result-chart">`;
        for (let type of ['D', 'I', 'S', 'C']) {
            const score = scores[type];
            const percent = (score / 30) * 100;
            chartHtml += `
                <div class="chart-item">
                    <div class="chart-bar-container">
                        <div class="chart-bar ${type}" style="height: ${percent}%"></div>
                    </div>
                    <div class="chart-label">${type}</div>
                    <div class="chart-score">${score}/30</div>
                </div>
            `;
        }
        chartHtml += `</div>`;
        
        const resultHtml = `
            <div class="result-card">
                <h2>📊 Kết quả DISC của ${this.userInfo.fullName}</h2>
                ${chartHtml}
                <div class="result-description">
                    <h3>🎯 Nhóm chính: <span style="color:#4a90e2">${descriptions[primaryType].name}</span></h3>
                    <p>${descriptions[primaryType].desc}</p>
                    <hr>
                    <h4>📈 Điểm chi tiết:</h4>
                    <ul>
                        <li>🔴 D (Thống trị): ${scores.D}/30</li>
                        <li>🟠 I (Ảnh hưởng): ${scores.I}/30</li>
                        <li>🟢 S (Kiên định): ${scores.S}/30</li>
                        <li>🟣 C (Tuân thủ): ${scores.C}/30</li>
                    </ul>
                </div>
                <button class="btn btn-primary" id="saveAndBackBtn">Quay lại</button>
            </div>
        `;
        
        this.showResult(resultHtml);
    },
    
    displayMBTIResult: function(mbtiType, dimensions) {
        const typeDescriptions = {
            'INTJ': 'Nhà khoa học, tư duy chiến lược',
            'INTP': 'Nhà tư duy, sáng tạo',
            'ENTJ': 'Nhà lãnh đạo, quyết đoán',
            'ENTP': 'Nhà tranh luận, đa tài',
            'INFJ': 'Người cố vấn, lý tưởng',
            'INFP': 'Người hòa giải, giàu cảm xúc',
            'ENFJ': 'Người truyền cảm hứng',
            'ENFP': 'Người khám phá, nhiệt huyết',
            'ISTJ': 'Người trách nhiệm, thực tế',
            'ISFJ': 'Người bảo vệ, tận tụy',
            'ESTJ': 'Người giám sát, hiệu quả',
            'ESFJ': 'Người chăm sóc, hòa đồng',
            'ISTP': 'Người thực hành, linh hoạt',
            'ISFP': 'Người nghệ sĩ, nhạy cảm',
            'ESTP': 'Người hành động, nhanh nhẹn',
            'ESFP': 'Người biểu diễn, vui vẻ'
        };
        
        const dimensionNames = {
            EI: dimensions.EI <= 0 ? 'Hướng ngoại (E)' : 'Hướng nội (I)',
            SN: dimensions.SN <= 0 ? 'Giác quan (S)' : 'Trực giác (N)',
            TF: dimensions.TF <= 0 ? 'Lý trí (T)' : 'Cảm xúc (F)',
            JP: dimensions.JP <= 0 ? 'Nguyên tắc (J)' : 'Linh hoạt (P)'
        };
        
        const resultHtml = `
            <div class="result-card">
                <h2>🧩 Kết quả MBTI của ${this.userInfo.fullName}</h2>
                <div style="text-align: center; margin: 24px 0;">
                    <div style="font-size: 48px; font-weight: bold; color: #4a90e2;">${mbtiType}</div>
                    <div style="font-size: 18px; margin-top: 8px;">${typeDescriptions[mbtiType] || 'Tính cách độc đáo của bạn'}</div>
                </div>
                <div class="result-description">
                    <h3>📐 Chi tiết 4 khía cạnh:</h3>
                    <ul>
                        <li><strong>Năng lượng:</strong> ${dimensionNames.EI}</li>
                        <li><strong>Nhận thức:</strong> ${dimensionNames.SN}</li>
                        <li><strong>Quyết định:</strong> ${dimensionNames.TF}</li>
                        <li><strong>Tổ chức:</strong> ${dimensionNames.JP}</li>
                    </ul>
                    <p style="margin-top: 16px;">💡 Mỗi người có sự kết hợp riêng, không có loại nào tốt hơn loại nào.</p>
                </div>
                <button class="btn btn-primary" id="saveAndBackBtn">Quay lại</button>
            </div>
        `;
        
        this.showResult(resultHtml);
    },
    
// Thêm biến này ở đầu file App (gần các biến khác)
googleScriptURL: 'https://script.google.com/macros/s/AKfycbyp-3yKkJQ1ycKYpPo2HgQynSP-vBfqcR5TD1Aky6ZsIRoC0qtpDK8hhggxCDE98sCk/exec', // 👈 THAY URL CỦA BẠN

showResult: function(resultHtml) {
    const container = document.getElementById('resultContainer');
    container.innerHTML = resultHtml;
    container.style.display = 'block';
    document.getElementById('testContent').style.display = 'none';
    
    // SỬA LẠI: Chỉ quay lại, không lưu nữa vì đã lưu khi nộp bài
    document.getElementById('saveAndBackBtn')?.addEventListener('click', () => {
        this.showScreen('info');
        this.resetTestState();
    });
},
    
    showScreen: function(screen) {
        this.currentScreen = screen;
        document.getElementById('infoScreen').style.display = screen === 'info' ? 'block' : 'none';
        document.getElementById('testScreen').style.display = screen === 'test' ? 'block' : 'none';
        
        if (screen === 'info') {
            // Reset test state
            this.resetTestState();
        }
    },
    
    resetTestState: function() {
        this.selectedTest = null;
        this.currentTestData = null;
        this.userAnswers = {};
        this.testResult = null;
        document.getElementById('testContent').innerHTML = '';
        document.getElementById('resultContainer').innerHTML = '';
        document.getElementById('resultContainer').style.display = 'none';
        document.getElementById('testContent').style.display = 'block';
        
        // Clear selection in UI
        document.querySelectorAll('.test-card').forEach(c => c.classList.remove('selected'));
        document.getElementById('startTestBtn').disabled = true;
    },
    
    showLoading: function(show) {
        // Simple loading indicator
        const btn = document.getElementById('startTestBtn');
        if (btn) {
            btn.textContent = show ? 'Đang tải...' : '▶ Bắt đầu test';
            btn.disabled = show;
        }
    }
};

// Khởi động
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});