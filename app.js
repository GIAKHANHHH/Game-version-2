(() => {
  "use strict";

  const STORAGE_KEY = "dauGiaKienThucTayTien_v1";
  const channel = ("BroadcastChannel" in window) ? new BroadcastChannel("dauGiaKienThucTayTien") : null;
  const params = new URLSearchParams(location.search);
  const isProjector = params.get("view") === "projector";
  const controlEl = document.getElementById("controlView");
  const projectorEl = document.getElementById("projectorView");
  const topActions = document.getElementById("topActions");
  const footer = document.getElementById("footer");

  const QUESTIONS = [
    {
      question: 'Cụm từ "không mọc tóc" trong câu thơ "Tây Tiến đoàn binh không mọc tóc" diễn tả điều gì về hiện thực và tinh thần của người lính?',
      options: [
        "Hiện thực sốt rét rừng hoành hành làm rụng tóc, nhưng được thể hiện bằng giọng điệu ngang tàng, kiêu dũng.",
        "Quy định về kiểu đầu đinh đặc thù của bộ đội chủ lực trong thời kỳ kháng chiến chống Pháp.",
        "Hình ảnh mang tính ước lệ tượng trưng để chỉ những người lính đầu trần chân đất.",
        "Sự bi lụy, xót xa trước những mất mát và tàn phá của bệnh tật nơi chiến trận."
      ],
      answer: "A"
    },
    {
      question: 'Cụm từ "heo hút cồn mây" dùng nghệ thuật gì để tả thiên nhiên?',
      options: ["Nhân hóa", "Đảo ngữ", "Ẩn dụ", "Nói giảm nói tránh."],
      answer: "B"
    },
    {
      question: "Các địa danh như Sài Khao, Mường Lát, Pha Luông, Sầm Nứa trong bài thơ xuất hiện theo dụng ý nào của nhà thơ?",
      options: [
        "Kể tên các trận đánh ác liệt nhất mà trung đoàn Tây Tiến từng tham gia.",
        "Vẽ nên bức tranh không gian hành quân rộng lớn, hiểm trở và hoang vu ở vùng biên giới Việt - Lào.",
        "Khắc họa những địa điểm dừng chân nghỉ ngơi lâu nhất của đoàn quân trong suốt cuộc kháng chiến.",
        "Liệt kê các tuyến đường giao thông huyết mạch do thực dân Pháp kiểm soát."
      ],
      answer: "B"
    },
    {
      question: "Câu thơ nào sau đây của Quang Dũng sử dụng hoàn toàn là thanh bằng nhằm tạo cảm giác không gian bao la, chơi vơi và tâm trạng nhẹ nhàng, bay bổng của người lính sau khi vượt qua dốc đèo hiểm trở?",
      options: [
        "“Dốc lên khúc khuỷu dốc thăm thẳm”",
        "“Heo hút cồn mây súng ngửi trời”",
        "“Nhà ai Pha Luông mưa xa khơi”",
        "“Nhớ ôi Tây Tiến cơm lên khói”"
      ],
      answer: "C"
    },
    {
      question: 'Cụm từ "quân xanh màu lá" trong đoạn chân dung người lính thể hiện điều gì ở đoàn binh Tây Tiến?',
      options: [
        "Bộ quân phục màu xanh lá cây đặc trưng của quân đội Việt Nam thời kỳ kháng chiến chống Pháp.",
        "Nét vẽ kiêu bạc biến làn da xanh xao vì sốt rét rừng thành màu xanh ngụy trang hòa nhập với thiên nhiên.",
        "Tinh thần trẻ trung, thanh xuân tràn đầy sức sống như những mầm lá non của người chiến sĩ.",
        "Sự thiếu thốn về ngụy trang khiến người lính phải hái lá cây rừng để che thân khi chiến đấu."
      ],
      answer: "B"
    }
  ];

  const GALA_QUESTION = "Theo em, phẩm chất đáng quý nhất của người lính Tây Tiến là gì? Vì sao?";
  const GALA_REFERENCE = "Có thể nêu tinh thần dũng cảm, kiên cường, ý chí vượt qua gian khổ hoặc lòng yêu nước, sẵn sàng hy sinh vì Tổ quốc. Cần giải thích hợp lý; ban tổ chức trực tiếp đánh giá, không chấm tự động.";

  function defaultState() {
    return {
      version: 1,
      phase: "setup",
      currentQuestion: 0,
      teams: ["A","B","C","D","E","F"].map(id => ({
        id, name: "Đội " + id, score: 100, bid: 10, answer: ""
      })),
      bidsLocked: false,
      galaDeadline: null,
      galaWinner: null,
      galaPublished: false,
      galaAnswerVisible: false,
      finalPublished: false,
      updatedAt: Date.now()
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.teams) || parsed.teams.length !== 6) return defaultState();
      return parsed;
    } catch (_) {
      return defaultState();
    }
  }

  let state = loadState();

  function save() {
    state.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (channel) channel.postMessage({ type: "state", state });
    render();
  }

  function receive(incoming) {
    if (!incoming || incoming.version !== 1 || !Array.isArray(incoming.teams)) return;
    if ((incoming.updatedAt || 0) >= (state.updatedAt || 0)) {
      state = incoming;
      render();
    }
  }

  if (channel) channel.onmessage = event => {
    if (event.data && event.data.type === "state") receive(event.data.state);
  };
  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try { receive(JSON.parse(event.newValue)); } catch (_) {}
    }
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    }[ch]));
  }
  function currentQ() { return QUESTIONS[state.currentQuestion]; }
  function topTeams() {
    const max = Math.max(...state.teams.map(t => t.score));
    return state.teams.filter(t => t.score === max);
  }
  function orderedTeams() {
    const copy = [...state.teams];
    if (state.galaWinner) {
      copy.sort((a,b) => {
        if (a.id === state.galaWinner) return -1;
        if (b.id === state.galaWinner) return 1;
        return b.score - a.score || a.id.localeCompare(b.id);
      });
    } else {
      copy.sort((a,b) => b.score - a.score || a.id.localeCompare(b.id));
    }
    return copy;
  }
  function phaseLabel() {
    return ({
      setup: "SẴN SÀNG", bidding: "ĐANG ĐẤU GIÁ", answering: "NHẬP ĐÁP ÁN",
      revealed: "ĐÃ CÔNG BỐ", gala: "VÒNG GALA", gala_result: "KẾT QUẢ GALA", final: "TỔNG KẾT"
    })[state.phase] || "ĐẤU GIÁ KIẾN THỨC";
  }
  function button(label, action, cls="btn") {
    return `<button class="${cls}" data-action="${action}">${label}</button>`;
  }

  // Âm thanh ngắn được tạo trực tiếp trong trình duyệt, không cần tải thêm tệp.
  let audioContext = null;
  function playSound(kind) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContext) audioContext = new AudioCtx();
      if (audioContext.state === "suspended") audioContext.resume();
      const patterns = {
        start: [523, 659, 784],
        lock: [440, 554],
        reveal: [523, 659, 784, 1047],
        next: [659, 784],
        gala: [392, 523, 659, 784],
        win: [523, 659, 784, 988, 1175],
        click: [620],
        timer: [740, 740, 740]
      };
      const notes = patterns[kind] || patterns.click;
      notes.forEach((frequency, index) => {
        const startAt = audioContext.currentTime + index * (kind === "timer" ? 0.16 : 0.11);
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = kind === "lock" ? "triangle" : "sine";
        oscillator.frequency.setValueAtTime(frequency, startAt);
        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(kind === "win" ? 0.11 : 0.065, startAt + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.2);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(startAt);
        oscillator.stop(startAt + 0.22);
      });
    } catch (_) {}
  }

  function openProjector() {
    const url = new URL(location.href);
    url.searchParams.set("view", "projector");
    const w = window.open(url.href, "dauGiaKienThucProjector", "width=1280,height=720");
    if (!w) {
      alert("Trình duyệt đã chặn cửa sổ mới. Hãy cho phép pop-up hoặc mở đường dẫn có ?view=projector trong tab mới.");
    }
  }

  function updateTeamName(id, value) {
    const team = state.teams.find(t => t.id === id);
    if (team && state.phase === "setup") {
      team.name = value.trim() || ("Đội " + id);
      save();
    }
  }

  function startGame() {
    if (state.phase !== "setup") return;
    state.phase = "bidding";
    state.currentQuestion = 0;
    state.teams.forEach(t => { t.score = 100; t.bid = 10; t.answer = ""; });
    state.bidsLocked = false;
    save();
  }

  function setBid(id, value) {
    if (state.phase !== "bidding" || state.bidsLocked) return;
    const team = state.teams.find(t => t.id === id);
    const bid = Number(value);
    if (team && [0,10,20,30].includes(bid) && bid <= team.score) {
      team.bid = bid;
      save();
    }
  }

  function lockBids() {
    if (state.phase !== "bidding") return;
    const invalid = state.teams.find(t => ![0,10,20,30].includes(t.bid) || t.bid > t.score);
    if (invalid) return alert(`${invalid.name} không đủ điểm cho mức cược hiện tại.`);
    state.bidsLocked = true;
    playSound("lock");
    state.teams.forEach(t => t.answer = "");
    state.phase = "answering";
    save();
  }

  function setAnswer(id, value) {
    if (state.phase !== "answering") return;
    const team = state.teams.find(t => t.id === id);
    if (team) { team.answer = value; save(); }
  }

  function revealAnswers() {
    if (state.phase !== "answering") return;
    const missing = state.teams.filter(t => !["A","B","C","D"].includes(t.answer));
    if (missing.length) return alert("Chưa nhập đáp án cho: " + missing.map(t => t.name).join(", "));
    const correct = currentQ().answer;
    state.teams.forEach(t => {
      if (t.answer === correct) t.score += t.bid;
      else t.score = Math.max(0, t.score - t.bid);
    });
    state.phase = "revealed";
    playSound("reveal");
    save();
  }

  function nextQuestion() {
    if (state.phase !== "revealed") return;
    if (state.currentQuestion < QUESTIONS.length - 1) {
      playSound("next");
      state.currentQuestion += 1;
      state.bidsLocked = false;
      state.teams.forEach(t => { t.bid = [10,20,30].find(n => n <= t.score) ?? 0; t.answer = ""; });
      state.phase = "bidding";
    } else {
      const leaders = topTeams();
      if (leaders.length > 1) {
        state.phase = "gala";
        playSound("gala");
        state.galaDeadline = Date.now() + 15000;
        state.galaWinner = null;
        state.galaPublished = false;
        state.galaAnswerVisible = false;
      } else {
        state.phase = "final";
      }
    }
    save();
  }

  function remainingSeconds() {
    if (!state.galaDeadline) return 0;
    return Math.max(0, Math.ceil((state.galaDeadline - Date.now()) / 1000));
  }

  function chooseGalaWinner(id) {
    if (state.phase !== "gala") return;
    if (!topTeams().some(t => t.id === id)) {
      alert("Chỉ được chọn trong các đội tham gia vòng Gala.");
      return;
    }
    state.galaWinner = id;
    save();
  }

  function publishGala() {
    if (state.phase !== "gala" || !state.galaWinner) return alert("Hãy chọn đội chiến thắng vòng Gala trước.");
    if (remainingSeconds() > 0) return alert("Hãy chờ hết 15 giây rồi mới công bố đội chiến thắng.");
    state.galaPublished = true;
    state.phase = "gala_result";
    playSound("win");
    save();
  }

  function toggleGalaReference() {
    if (state.phase !== "gala_result") return;
    state.galaAnswerVisible = !state.galaAnswerVisible;
    save();
  }

  function publishFinal() {
    if (state.phase !== "final" && state.phase !== "gala_result") return;
    if (state.phase === "gala_result" && !state.galaPublished) return;
    state.phase = "final";
    state.finalPublished = true;
    playSound("win");
    save();
  }

  function resetGame() {
    if (!confirm("Bạn có chắc muốn chơi lại từ đầu? Toàn bộ điểm và tiến trình hiện tại sẽ được đặt lại.")) return;
    state = defaultState();
    save();
  }

  function controlHeader() {
    topActions.innerHTML = `
      <span class="pill">${phaseLabel()}</span>
      <button class="btn secondary small" data-action="open-projector">Mở màn chiếu ↗</button>
      <button class="btn danger small" data-action="reset">Chơi lại</button>
    `;
  }

  function setupPanel() {
    return `
      <section class="hero">
        <div class="eyebrow">GAME SHOW KIẾN THỨC · TÂY TIẾN</div>
        <h1>ĐẤU GIÁ KIẾN THỨC</h1>
        <p>6 đội · 5 câu hỏi chính · Cược điểm công khai · Đáp án bí mật · Gala phân định khi đồng điểm cao nhất.</p>
        <div class="row">
          <div class="pill">100 điểm khởi đầu / đội</div>
          <div class="pill">Mức cược: 10 · 20 · 30 điểm</div>
          <div class="pill">Tự lưu tiến trình trên trình duyệt</div>
        </div>
      </section>
      <div class="grid">
        <section class="card span-8">
          <h2>Thiết lập 6 đội</h2>
          <div class="team-grid">
            ${state.teams.map(t => `
              <div class="team-card">
                <div class="team-name">Đội ${t.id}</div>
                <div class="field"><label>Tên hiển thị</label><input data-team-name="${t.id}" value="${escapeHtml(t.name)}" maxlength="24"></div>
                <div class="muted">Điểm khởi đầu: <strong>100</strong></div>
              </div>`).join("")}
          </div>
        </section>
        <section class="card span-4 stack">
          <h2>Sẵn sàng chưa?</h2>
          <div class="stat-grid">
            <div class="stat"><strong>06</strong><span>ĐỘI</span></div>
            <div class="stat"><strong>05</strong><span>CÂU CHÍNH</span></div>
            <div class="stat"><strong>15s</strong><span>GALA (NẾU CẦN)</span></div>
          </div>
          <div class="note">Mở màn chiếu trên cửa sổ riêng. Nếu có máy chiếu thứ hai, kéo cửa sổ màn chiếu sang đó và nhấn F11.</div>
          ${button("BẮT ĐẦU TRÒ CHƠI", "start", "btn full")}
          ${button("MỞ MÀN CHIẾU", "open-projector", "btn secondary full")}
        </section>
      </div>`;
  }

  function teamsScoreCards() {
    return `<div class="team-grid">${state.teams.map(t => `
      <div class="team-card">
        <div class="row"><span class="team-name">${escapeHtml(t.name)}</span><span class="status">${t.id}</span></div>
        <div class="team-score">${t.score} điểm</div>
      </div>`).join("")}</div>`;
  }

  function questionPanel(showAnswers=true) {
    const q = currentQ();
    return `
      <div class="question-box">
        <div class="row"><span class="question-label">CÂU HỎI ${state.currentQuestion + 1} / 5</span><span class="status">TÂY TIẾN</span></div>
        <div class="question-text">${escapeHtml(q.question)}</div>
        ${showAnswers ? q.options.map((o,i) => `<div class="option ${state.phase === "revealed" && q.answer === "ABCD"[i] ? "correct" : ""}"><b>${"ABCD"[i]}.</b><span>${escapeHtml(o)}</span></div>`).join("") : ""}
      </div>`;
  }

  function biddingPanel() {
    return `
      <section class="hero">
        <div class="eyebrow">ĐIỀU KHIỂN BAN TỔ CHỨC</div>
        <h1>Câu ${state.currentQuestion + 1} / 5</h1>
        <p>Chọn mức cược cho từng đội. Mức cược được công khai trên màn chiếu.</p>
      </section>
      <div class="grid">
        <section class="card span-8">
          ${questionPanel()}
        </section>
        <section class="card span-4">
          <h2>Nhập mức cược</h2>
          ${state.teams.map(t => `
            <div class="row" style="margin:12px 0">
              <strong>${escapeHtml(t.name)}</strong>
              <select data-bid="${t.id}" ${state.bidsLocked ? "disabled" : ""}>
                ${[0,10,20,30].map(n => `<option value="${n}" ${t.bid===n?"selected":""} ${n>t.score?"disabled":""}>${n===0?"Bỏ cược (0 điểm)":n+" điểm"}</option>`).join("")}
              </select>
            </div>`).join("")}
          <div class="note">Màn chiếu chỉ hiển thị mức cược, không hiển thị đáp án mà ban tổ chức nhập.</div>
          ${button("KHÓA MỨC CƯỢC", "lock-bids", "btn full")}
        </section>
        <section class="card span-12">
          <h2>Điểm hiện tại</h2>${teamsScoreCards()}
        </section>
      </div>`;
  }

  function answerPanel() {
    return `
      <section class="hero">
        <div class="eyebrow">ĐIỀU KHIỂN RIÊNG · ĐÁP ÁN KHÔNG HIỂN THỊ TRÊN MÀN CHIẾU</div>
        <h1>Nhập đáp án các đội</h1>
        <p>Các đội đã giơ bảng. Ban tổ chức chọn đáp án quan sát được cho từng đội, sau đó công bố kết quả.</p>
      </section>
      <div class="answer-layout">
        <section class="card">${questionPanel()}</section>
        <section class="card">
          <div class="row answer-heading">
            <div><h2>Đáp án của 6 đội</h2><p class="muted">Chọn A, B, C hoặc D theo bảng đáp án mỗi đội giơ lên.</p></div>
            <span class="status gold">CHỈ BAN TỔ CHỨC</span>
          </div>
          <div class="answer-row">
            ${state.teams.map(t => `
              <div class="answer-cell">
                <div class="answer-team">${escapeHtml(t.name)}</div>
                <label for="answer-${t.id}">Đáp án đã giơ</label>
                <select id="answer-${t.id}" data-answer="${t.id}">
                  <option value="">Chưa nhập</option>
                  ${["A","B","C","D"].map(a => `<option value="${a}" ${t.answer===a?"selected":""}>Đáp án ${a}</option>`).join("")}
                </select>
              </div>`).join("")}
          </div>
          <div class="note warning answer-note">Các lựa chọn này chỉ xuất hiện trên máy điều khiển. Màn chiếu không hiển thị đáp án từng đội.</div>
          <div class="answer-actions">${button("CÔNG BỐ KẾT QUẢ CÂU NÀY", "reveal", "btn gold")}</div>
        </section>
        <section class="card"><h2>Mức cược công khai</h2>${publicBidsTable()}</section>
      </div>`;
  }

  function publicBidsTable() {
    return `<div class="table-wrap"><table><thead><tr><th>Đội</th><th>Điểm hiện tại</th><th>Mức cược</th></tr></thead><tbody>
      ${state.teams.map(t => `<tr><td><strong>${escapeHtml(t.name)}</strong></td><td>${t.score}</td><td><strong>${t.bid} điểm</strong></td></tr>`).join("")}
      </tbody></table></div>`;
  }

  function revealedPanel() {
    const q = currentQ();
    return `
      <section class="hero">
        <div class="eyebrow">KẾT QUẢ CÂU ${state.currentQuestion + 1}</div>
        <h1>ĐÁP ÁN CHÍNH XÁC: ${q.answer}</h1>
        <p>Đội trả lời đúng được cộng điểm cược; đội trả lời sai bị trừ điểm cược.</p>
      </section>
      <div class="grid">
        <section class="card span-6">
          ${questionPanel()}
        </section>
        <section class="card span-6">
          <h2>Kết quả từng đội</h2>
          <div class="table-wrap"><table><thead><tr><th>Đội</th><th>Đã chọn</th><th>Cược</th><th>Kết quả</th><th>Điểm mới</th></tr></thead><tbody>
          ${state.teams.map(t => `<tr><td><strong>${escapeHtml(t.name)}</strong></td><td>${t.answer}</td><td>${t.bid}</td><td><span class="status ${t.answer===q.answer?"good":"bad"}">${t.answer===q.answer?"ĐÚNG":"SAI"}</span></td><td><strong>${t.score}</strong></td></tr>`).join("")}
          </tbody></table></div>
        </section>
        <section class="card span-12">
          <h2>Bảng điểm sau câu ${state.currentQuestion + 1}</h2>${teamsScoreCards()}
          ${button(state.currentQuestion === 4 ? "KẾT THÚC 5 CÂU CHÍNH" : "SANG CÂU TIẾP THEO", "next", "btn full")}
        </section>
      </div>`;
  }

  function galaPanel() {
    const leaders = topTeams();
    const remain = remainingSeconds();
    return `
      <section class="hero">
        <div class="eyebrow">VÒNG GALA · CHỈ DÀNH CHO CÁC ĐỘI ĐỒNG ĐIỂM CAO NHẤT</div>
        <h1>PHÂN ĐỊNH GIẢI NHẤT</h1>
        <p>Chỉ các đội đang có điểm cao nhất bằng nhau được tham gia. Các đội viết câu trả lời lên bảng; ban tổ chức trực tiếp đánh giá.</p>
      </section>
      <div class="grid">
        <section class="card span-7">
          <div class="question-box">
            <div class="question-label">CÂU HỎI TỰ LUẬN DUY NHẤT</div>
            <div class="question-text">${GALA_QUESTION}</div>
            <div class="big-timer" id="controlTimer">${remain}</div>
            <div class="muted center-screen">THỜI GIAN CÒN LẠI · 15 GIÂY</div>
          </div>
          <div class="note warning" style="margin-top:14px">Hết giờ, ban tổ chức chọn đội có câu trả lời tốt nhất. Game không tự chấm câu hỏi tự luận.</div>
        </section>
        <section class="card span-5">
          <h2>Đội tham gia Gala</h2>
          <div class="stack">
            ${leaders.map(t => `<div class="team-card"><div class="row"><strong>${escapeHtml(t.name)}</strong><span class="status gold">${t.score} điểm</span></div></div>`).join("")}
          </div>
          <div class="divider"></div>
          <h3>Chọn đội chiến thắng</h3>
          <select id="galaWinner">
            <option value="">-- Chọn đội --</option>
            ${leaders.map(t => `<option value="${t.id}" ${state.galaWinner===t.id?"selected":""}>${escapeHtml(t.name)}</option>`).join("")}
          </select>
          <div class="muted" style="font-size:12px;margin:9px 0">Chỉ chọn được đội thuộc nhóm đồng điểm cao nhất.</div>
          ${button("XÁC NHẬN ĐỘI THẮNG & CÔNG BỐ", "publish-gala", "btn gold full")}
        </section>
      </div>`;
  }

  function galaResultPanel() {
    const winner = state.teams.find(t => t.id === state.galaWinner);
    return `
      <section class="hero center-screen">
        <div class="eyebrow">KẾT QUẢ VÒNG GALA</div>
        <div class="winner-title">${winner ? escapeHtml(winner.name) : "ĐỘI CHIẾN THẮNG"}</div>
        <h1>GIÀNH CHIẾN THẮNG VÒNG GALA!</h1>
        <p>Ban tổ chức đã đánh giá câu trả lời và xác nhận đội chiến thắng.</p>
      </section>
      <div class="grid">
        <section class="card span-12">
          <div class="row">
            <h2>Đáp án tham khảo</h2>
            ${button(state.galaAnswerVisible ? "ẨN ĐÁP ÁN" : "XEM ĐÁP ÁN THAM KHẢO", "toggle-gala-answer", "btn secondary")}
          </div>
          ${state.galaAnswerVisible ? `<div class="note">${GALA_REFERENCE}</div>` : `<p class="muted">Đáp án tham khảo đang được ẩn. Chỉ hiển thị khi ban tổ chức nhấn nút.</p>`}
          <div class="divider"></div>
          ${button("CÔNG BỐ BẢNG XẾP HẠNG 6 GIẢI", "publish-final", "btn gold full")}
        </section>
      </div>`;
  }

  function finalPanel() {
    const ranks = orderedTeams();
    return `
      <section class="hero center-screen">
        <div class="eyebrow">KẾT QUẢ CHUNG CUỘC</div>
        <h1>VINH DANH 6 ĐỘI</h1>
        <p>Thứ hạng được sắp xếp duy nhất từ giải Nhất đến giải Sáu, không có đồng giải.</p>
      </section>
      <section class="card">
        <div class="rank-list">
          ${ranks.map((t,i) => `<div class="rank-item ${i===0?"first":""}">
            <div class="rank-no">${["01","02","03","04","05","06"][i]}</div>
            <div><strong>${["GIẢI NHẤT","GIẢI NHÌ","GIẢI BA","GIẢI TƯ","GIẢI NĂM","GIẢI SÁU"][i]}</strong><div class="muted">${escapeHtml(t.name)}</div></div>
            <strong>${t.score} điểm</strong>
          </div>`).join("")}
        </div>
        <div class="note">Nếu các đội ở vị trí ngoài giải Nhất bằng điểm, game dùng thứ tự tên đội A → F để sắp xếp ổn định, bảo đảm không có đồng giải.</div>
        ${!state.finalPublished ? button("CÔNG BỐ BẢNG XẾP HẠNG", "publish-final", "btn gold full") : ""}
        ${button("CHƠI LẠI TỪ ĐẦU", "reset", "btn secondary full")}
      </section>`;
  }

  function renderControl() {
    controlEl.classList.remove("hidden");
    projectorEl.classList.add("hidden");
    footer.classList.remove("hidden");
    controlHeader();
    let content = "";
    switch (state.phase) {
      case "setup": content = setupPanel(); break;
      case "bidding": content = biddingPanel(); break;
      case "answering": content = answerPanel(); break;
      case "revealed": content = revealedPanel(); break;
      case "gala": content = galaPanel(); break;
      case "gala_result": content = galaResultPanel(); break;
      case "final": content = finalPanel(); break;
      default: content = setupPanel();
    }
    controlEl.innerHTML = content;
    bindControlEvents();
  }

  function projectorTeams() {
    return `<div class="team-grid">${state.teams.map(t => `
      <div class="team-card">
        <div class="team-name">${escapeHtml(t.name)}</div>
        <div class="team-score">${t.score}</div>
        <div class="muted">ĐIỂM</div>
      </div>`).join("")}</div>`;
  }

  function projectorBids() {
    return `<div class="team-grid">${state.teams.map(t => `
      <div class="team-card">
        <div class="team-name">${escapeHtml(t.name)}</div>
        <div class="team-score">${t.bid}</div>
        <div class="muted">ĐIỂM CƯỢC</div>
      </div>`).join("")}</div>`;
  }

  function projectorQuestion() {
    const q = currentQ();
    return `
      <div class="projector-top"><div class="projector-kicker">CÂU ${state.currentQuestion + 1} / 5</div><span class="pill">TÂY TIẾN · QUANG DŨNG</span></div>
      <div class="question-box">
        <div class="question-text">${escapeHtml(q.question)}</div>
        ${q.options.map((o,i) => `<div class="option ${state.phase==="revealed" && q.answer==="ABCD"[i]?"correct":""}"><b>${"ABCD"[i]}.</b><span>${escapeHtml(o)}</span></div>`).join("")}
      </div>`;
  }

  function renderProjector() {
    controlEl.classList.add("hidden");
    projectorEl.classList.remove("hidden");
    topActions.innerHTML = `<button class="btn secondary small" data-action="fullscreen">Toàn màn hình ⛶</button>`;
    footer.classList.add("hidden");
    let html = "";
    if (state.phase === "setup") {
      html = `<div class="center-screen"><div class="projector-kicker">GAME SHOW KIẾN THỨC</div><div class="winner-title">ĐẤU GIÁ<br>KIẾN THỨC</div><h2>TÂY TIẾN · QUANG DŨNG</h2><p>6 ĐỘI · 5 CÂU HỎI · CẠNH TRANH ĐIỂM SỐ</p><div class="note">Ban tổ chức chuẩn bị bắt đầu trò chơi.</div></div>`;
    } else if (state.phase === "bidding") {
      html = `${projectorQuestion()}<div class="divider"></div><h2>MỨC CƯỢC CÔNG KHAI</h2>${projectorBids()}<p class="center-screen">Các đội chuẩn bị ghi đáp án lên bảng và giơ lên cùng lúc.</p>`;
    } else if (state.phase === "answering") {
      html = `${projectorQuestion()}<div class="divider"></div><h2>MỨC CƯỢC CÔNG KHAI</h2>${projectorBids()}<div class="note center-screen">Các đội hãy ghi đáp án lên bảng. Ban tổ chức đang nhập lựa chọn riêng.</div>`;
    } else if (state.phase === "revealed") {
      const q = currentQ();
      html = `${projectorQuestion()}<div class="center-screen"><div class="winner-title">ĐÁP ÁN: ${q.answer}</div></div>${projectorTeams()}`;
    } else if (state.phase === "gala") {
      const participants = topTeams();
      html = `<div class="projector-top"><div class="projector-kicker">VÒNG GALA · PHÂN ĐỊNH GIẢI NHẤT</div><span class="pill">15 GIÂY · 1 CÂU DUY NHẤT</span></div>
        <div class="question-box"><div class="question-label">CÂU HỎI TỰ LUẬN</div><div class="question-text">${GALA_QUESTION}</div></div>
        <div class="big-timer" id="projectorTimer">${remainingSeconds()}</div><div class="center-screen muted">HÃY VIẾT CÂU TRẢ LỜI LÊN BẢNG</div>
        <div class="divider"></div><h2 class="center-screen">CÁC ĐỘI THAM GIA</h2><div class="team-grid">${participants.map(t=>`<div class="team-card"><div class="team-name">${escapeHtml(t.name)}</div><div class="team-score">${t.score}</div><div class="muted">ĐIỂM</div></div>`).join("")}</div>`;
    } else if (state.phase === "gala_result") {
      const winner = state.teams.find(t=>t.id===state.galaWinner);
      html = `<div class="center-screen"><div class="projector-kicker">KẾT QUẢ VÒNG GALA</div><div class="winner-title">CHÚC MỪNG<br>${winner?escapeHtml(winner.name):""}!</div><h1>CHIẾN THẮNG VÒNG GALA</h1><p>Ban tổ chức đã xác nhận kết quả.</p></div>`;
    } else if (state.phase === "final") {
      if (!state.finalPublished) {
        html = `<div class="center-screen"><div class="projector-kicker">TỔNG KẾT</div><div class="winner-title">ĐÃ HOÀN THÀNH<br>5 CÂU HỎI</div><h2>Ban tổ chức chuẩn bị công bố thứ hạng.</h2></div>`;
      } else {
        const ranks = orderedTeams();
        html = `<div class="center-screen"><div class="projector-kicker">VINH DANH · KẾT QUẢ CHUNG CUỘC</div><div class="winner-title">CHÚC MỪNG CÁC ĐỘI!</div></div><div class="rank-list">${ranks.map((t,i)=>`<div class="rank-item ${i===0?"first":""}"><div class="rank-no">${i+1}</div><div><strong>${["GIẢI NHẤT","GIẢI NHÌ","GIẢI BA","GIẢI TƯ","GIẢI NĂM","GIẢI SÁU"][i]}</strong><div class="muted">${escapeHtml(t.name)}</div></div><strong>${t.score} điểm</strong></div>`).join("")}</div>`;
      }
    }
    projectorEl.innerHTML = html;
  }

  function bindControlEvents() {
    controlEl.querySelectorAll("[data-action]").forEach(el => el.addEventListener("click", () => {
      const action = el.dataset.action;
      if (action === "start") { playSound("start"); startGame(); }
      if (action === "open-projector") openProjector();
      if (action === "lock-bids") lockBids();
      if (action === "reveal") revealAnswers();
      if (action === "next") nextQuestion();
      if (action === "publish-gala") publishGala();
      if (action === "toggle-gala-answer") toggleGalaReference();
      if (action === "publish-final") publishFinal();
      if (action === "reset") resetGame();
    }));
    controlEl.querySelectorAll("[data-team-name]").forEach(el => el.addEventListener("change", () => updateTeamName(el.dataset.teamName, el.value)));
    controlEl.querySelectorAll("[data-bid]").forEach(el => el.addEventListener("change", () => setBid(el.dataset.bid, el.value)));
    controlEl.querySelectorAll("[data-answer]").forEach(el => el.addEventListener("change", () => setAnswer(el.dataset.answer, el.value)));
    const winnerSelect = document.getElementById("galaWinner");
    if (winnerSelect) winnerSelect.addEventListener("change", () => chooseGalaWinner(winnerSelect.value));
  }

  function render() {
    if (isProjector) renderProjector();
    else renderControl();
  }

  topActions.addEventListener("click", event => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "fullscreen") {
      const target = document.documentElement;
      if (target.requestFullscreen) target.requestFullscreen().catch(() => {});
    }
    if (action === "open-projector") openProjector();
    if (action === "reset") resetGame();
  });

  let timerPaint = null;
  let soundedDeadline = null;
  function startTimerRefresh() {
    if (timerPaint) clearInterval(timerPaint);
    timerPaint = setInterval(() => {
      if (state.phase !== "gala") return;
      const secs = remainingSeconds();
      const a = document.getElementById("controlTimer");
      const b = document.getElementById("projectorTimer");
      if (a) a.textContent = secs;
      if (b) b.textContent = secs;
      if (secs === 0 && !isProjector && state.galaDeadline && soundedDeadline !== state.galaDeadline) {
        soundedDeadline = state.galaDeadline;
        playSound("timer");
      }
    }, 200);
  }

  render();
  startTimerRefresh();
  window.addEventListener("beforeunload", () => { if (timerPaint) clearInterval(timerPaint); });
})();
