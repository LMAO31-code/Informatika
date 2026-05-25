
// Daftar mata pelajaran lengkap
const subjectsList = [
  "Seni Budaya",
  "Bahasa Jawa",
  "BK",
  "Agama",
  "Informatika Umum",
  "Informatika Pilihan",
  "Matematika",
  "Matematika Tingkat Lanjut",
  "Bahasa Inggris",
  "Bahasa Inggris Tingkat Lanjut",
  "Biologi",
  "Kimia",
  "Geografi",
  "Sosiologi",
  "Ekonomi",
  "Mandarin",
  "Sejarah",
  "PKN",
  "Bahasa Indonesia"
];

let editId = null;
let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
let currentUser = null;

let tasks = JSON.parse(localStorage.getItem("tasks")) || {};
if (typeof tasks !== "object" || tasks === null) {
  tasks = {};
}

let checkedTasks = JSON.parse(localStorage.getItem("checkedTasks")) || {};

// Fungsi untuk menampilkan/menyembunyikan dropdown kelas berdasarkan role
function toggleClassField() {
  const role = document.getElementById("role").value;
  const classGroup = document.getElementById("classGroup");
  if (role === "student") {
    classGroup.style.display = "block";
  } else {
    classGroup.style.display = "none";
  }
}

// Event listener untuk perubahan role
document.getElementById("role").addEventListener("change", toggleClassField);

function generateRandomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 
  let password = "";
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function initTeacherTasks(){
  if(!currentUser) return;
  if(currentUser.role === "teacher"){
    if(!tasks[currentUser.username]){
      tasks[currentUser.username] = [];
    }
  }
}

// Preview gambar deskripsi
document.getElementById("descImageInput")?.addEventListener("change", function(e){
  const file = e.target.files[0];
  if(file){
    const reader = new FileReader();
    reader.onload = function(ev){
      const imgPreview = document.getElementById("descImagePreview");
      imgPreview.src = ev.target.result;
      imgPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    document.getElementById("descImagePreview").style.display = "none";
  }
});

// Generate daftar mata pelajaran di halaman siswa
function generateSubjectList() {
  const container = document.getElementById("subjectsContainer");
  if (!container) return;
  container.innerHTML = "";
  
  subjectsList.forEach(subject => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "class-card";
    const containerId = "container_" + subject.replace(/ /g, '_').replace(/\(/g, '').replace(/\)/g, '');
    cardDiv.setAttribute("onclick", `toggleSubject('${containerId}')`);
    cardDiv.innerHTML = `<h3>📘 ${subject}</h3><p>Klik untuk melihat tugas</p>`;
    container.appendChild(cardDiv);
    
    const taskContainer = document.createElement("div");
    taskContainer.id = containerId;
    taskContainer.className = "task-container";
    container.appendChild(taskContainer);
  });
}

function toggleSubject(id){
  const taskContainer = document.getElementById(id);
  if(taskContainer) {
    taskContainer.style.display = (taskContainer.style.display === "block") ? "none" : "block";
  }
}

function openModal(id) {
  document.getElementById(id).style.display = "flex";
}

function closeModal(event, id) {
  if(event.target === document.getElementById(id)) {
    document.getElementById(id).style.display = "none";
  }
}

function switchTab(target) {
  const profileSection = document.getElementById("profileSection");
  const classSection = document.getElementById("classSection");
  const navItems = document.querySelectorAll("#bottomNav .nav-item");

  navItems[0].classList.remove("active");
  navItems[1].classList.remove("active");

  if (target === 'profile') {
    profileSection.style.display = "block";
    classSection.style.display = "none";
    navItems[0].classList.add("active");
  } else if (target === 'class') {
    profileSection.style.display = "none";
    classSection.style.display = "block";
    navItems[1].classList.add("active");
    updateChart();
  }
}

function switchForm(){
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const title = document.getElementById("formTitle");

  if(loginForm.style.display !== "none"){
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    title.innerText = "Sign Up";
    toggleClassField();
  } else {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    title.innerText = "Sign In";
  }
}

function register(){
  const fullName = document.getElementById("fullName").value;
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const role = document.getElementById("role").value;
  let selectedClass = "";
  if (role === "student") {
    selectedClass = document.getElementById("classSelect").value;
    if (!selectedClass) {
      alert("Pilih kelas terlebih dahulu!");
      return;
    }
  }

  if(!fullName || !username || !email || !password){
    alert("Semua data harus diisi!");
    return;
  }

  if(password !== confirmPassword){
    alert("Password tidak sama!");
    return;
  }

  const exist = accounts.find(acc => acc.username === username || acc.email === email);
  if(exist){
    alert("Username atau email sudah digunakan!");
    return;
  }

  const user = { fullName, username, email, password, role, class: selectedClass };
  accounts.push(user);
  localStorage.setItem("accounts", JSON.stringify(accounts));

  alert("Register berhasil! Silakan login.");
  switchForm();

  document.getElementById("loginUser").value = username;
  document.getElementById("loginPass").value = password;
}

function login(){
  const loginUser = document.getElementById("loginUser").value;
  const loginPass = document.getElementById("loginPass").value;

  const foundUser = accounts.find(acc =>
    (acc.username === loginUser || acc.email === loginUser) && acc.password === loginPass
  );

  if(!foundUser){
    alert("Akun tidak ditemukan atau password salah!");
    return;
  }

  currentUser = foundUser;
  initTeacherTasks();

  document.getElementById("authBox").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("bottomNav").style.display = "flex";

  switchTab('profile');

  document.getElementById("profileName").innerText = foundUser.fullName;
  document.getElementById("profileUsername").innerText = foundUser.username;
  document.getElementById("profileEmail").innerText = foundUser.email;

  if(foundUser.role === "student"){
    document.getElementById("studentPanel").style.display = "block";
    document.getElementById("teacherPanel").style.display = "none";
    document.getElementById("dashboardTitle").innerText = "Dashboard Siswa";
    document.getElementById("profileRole").innerText = "Siswa";
    document.getElementById("classRow").style.display = "block";
    document.getElementById("profileClass").innerText = foundUser.class || "Belum diisi";
    
    // Generate daftar mata pelajaran untuk siswa
    generateSubjectList();
    
    const savedPhoto = localStorage.getItem("profileImage_student_" + foundUser.username);
    document.getElementById("profileImage").src = savedPhoto ? savedPhoto : "https://via.placeholder.com/150";
  } else {
    document.getElementById("studentPanel").style.display = "none";
    document.getElementById("teacherPanel").style.display = "block";
    document.getElementById("dashboardTitle").innerText = "Dashboard Guru";
    document.getElementById("profileRole").innerText = "Guru";
    document.getElementById("classRow").style.display = "none";

    // Isi dropdown mata pelajaran untuk guru
    const subjectSelect = document.getElementById("subjectSelect");
    subjectSelect.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';
    subjectsList.forEach(sub => {
      const option = document.createElement("option");
      option.value = sub;
      option.textContent = sub;
      subjectSelect.appendChild(option);
    });

    const savedPhoto = localStorage.getItem("profileImage_teacher_" + foundUser.username);
    document.getElementById("profileImage").src = savedPhoto ? savedPhoto : "https://via.placeholder.com/150";
  }
  
  loadTasks();
}

function logout(){
  currentUser = null;
  editId = null;
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("bottomNav").style.display = "none"; 
  document.getElementById("authBox").style.display = "block";
  document.getElementById("loginUser").value = "";
  document.getElementById("loginPass").value = "";
  resetTeacherForm();
}

document.getElementById("photoInput").addEventListener("change", function(e){
  const file = e.target.files[0];
  if(file && currentUser){
    const reader = new FileReader();
    reader.onload = function(event){
      const imageData = event.target.result;
      document.getElementById("profileImage").src = imageData;
      
      const storageKey = "profileImage_" + currentUser.role + "_" + currentUser.username;
      localStorage.setItem(storageKey, imageData);
    };
    reader.readAsDataURL(file);
  }
});

function removePhoto() {
  if (currentUser) {
    document.getElementById("profileImage").src = "https://via.placeholder.com/150";
    const storageKey = "profileImage_" + currentUser.role + "_" + currentUser.username;
    localStorage.removeItem(storageKey);
    document.getElementById("photoInput").value = "";
  }
}

function verifyTaskPassword(taskId, teacherUsername) {
  if (!currentUser || currentUser.role !== "student") return;

  const inputElem = document.getElementById(`pass-input-${taskId}`);
  const enteredPassword = inputElem.value.trim().toUpperCase();

  if (!enteredPassword) {
    alert("Masukkan password validasi terlebih dahulu!");
    return;
  }

  let targetTask = null;
  if (tasks[teacherUsername]) {
    targetTask = tasks[teacherUsername].find(t => t.id === taskId);
  }

  if (!targetTask) {
    alert("Data tugas tidak ditemukan!");
    return;
  }

  if (targetTask.currentPassword === enteredPassword) {
    const studentKey = currentUser.username;
    if (!checkedTasks[studentKey]) {
      checkedTasks[studentKey] = [];
    }
    
    if (!checkedTasks[studentKey].includes(taskId)) {
      checkedTasks[studentKey].push(taskId);
    }
    localStorage.setItem("checkedTasks", JSON.stringify(checkedTasks));

    targetTask.currentPassword = generateRandomPassword();
    localStorage.setItem("tasks", JSON.stringify(tasks));

    alert("🎉 Password Benar! Status tugas Anda berhasil diperbarui menjadi SELESAI.");
    loadTasks();
  } else {
    alert("❌ Password salah atau sudah kedaluwarsa! Tanyakan password baru ke guru Anda.");
  }
}

function addTask(){
  if(!currentUser){
    alert("Silakan login dulu!");
    return;
  }

  initTeacherTasks();

  const subject = document.getElementById("subjectSelect").value;
  const taskText = document.getElementById("taskInput").value;
  const deadline = document.getElementById("deadlineInput").value;
  const descText = document.getElementById("descText").value;
  let descImage = "";
  const imgFile = document.getElementById("descImageInput").files[0];
  if(imgFile){
    const reader = new FileReader();
    reader.onload = function(e){
      descImage = e.target.result;
      saveTaskToLocal(subject, taskText, deadline, descText, descImage);
    };
    reader.readAsDataURL(imgFile);
  } else {
    saveTaskToLocal(subject, taskText, deadline, descText, descImage);
  }
}

function saveTaskToLocal(subject, taskText, deadline, descText, descImage){
  const teacherKey = currentUser.username;
  if(editId !== null){
    tasks[teacherKey] = tasks[teacherKey].map(t =>
      t.id === editId ? { ...t, subject, task: taskText, deadline, descriptionText: descText, descriptionImage: descImage } : t
    );
    editId = null;
  } else {
    tasks[teacherKey].push({
      id: Date.now(),
      subject,
      task: taskText,
      deadline,
      teacher: teacherKey,
      currentPassword: generateRandomPassword(),
      descriptionText: descText,
      descriptionImage: descImage
    });
  }
  localStorage.setItem("tasks", JSON.stringify(tasks));
  resetTeacherForm();
  loadTasks();
}

function loadTasks(){
  if(!currentUser) return;

  const teacherList = document.getElementById("teacherTaskList");
  if(teacherList) teacherList.innerHTML = "";

  // Hapus semua task container siswa
  subjectsList.forEach(subject => {
    const containerId = "container_" + subject.replace(/ /g, '_').replace(/\(/g, '').replace(/\)/g, '');
    const container = document.getElementById(containerId);
    if(container) container.innerHTML = "";
  });

  let allTasks = [];
  Object.keys(tasks).forEach(teacher => {
    if(Array.isArray(tasks[teacher])){
      tasks[teacher].forEach(t => {
        allTasks.push(t);
      });
    }
  });

  const studentKey = currentUser.username;
  const userCheckedList = checkedTasks[studentKey] || [];

  allTasks.forEach(data => {
    if(currentUser.role === "teacher" && data.teacher === currentUser.username){
      const card = document.createElement("div");
      card.className = "teacher-card";
      
      let descImageHtml = "";
      if(data.descriptionImage && data.descriptionImage.trim() !== ""){
        descImageHtml = `<div style="margin-top:8px;"><img src="${data.descriptionImage}" style="max-width:100%; max-height:150px; border-radius:12px;"></div>`;
      }
      let descTextHtml = data.descriptionText ? `<p style="margin-top:8px; font-size:13px; opacity:0.9;">📄 ${data.descriptionText}</p>` : "";
      
      card.innerHTML = `
        <h3>📚 ${data.subject}</h3>
        <p>📝 ${data.task}</p>
        ${descTextHtml}
        ${descImageHtml}
        <small>📅 Deadline: ${data.deadline}</small><br>
        <div style="margin-top: 5px;">
          <small style="color: #60a5fa;">🔑 Token Akses Murid Saat Ini:</small><br>
          <span class="password-badge">${data.currentPassword || 'TITIK-KOSONG'}</span>
        </div>
        <div style="margin-top:12px; display:flex; gap:10px;">
          <button onclick="startEdit(${data.id})" style="background:#facc15; color:black; padding:6px 14px; border:none; border-radius:8px; width:auto; margin:0; cursor:pointer; font-size:13px;">
            <i class="ri-edit-line"></i> Edit
          </button>
          <button onclick="deleteTask(${data.id})" style="background:#ef4444; color:white; padding:6px 14px; border:none; border-radius:8px; width:auto; margin:0; cursor:pointer; font-size:13px;">
            <i class="ri-delete-bin-line"></i> Hapus
          </button>
        </div>
      `;
      if(teacherList) teacherList.appendChild(card);
    }

    if(currentUser.role === "student") {
      const isCompleted = userCheckedList.includes(data.id);
      const studentTaskCard = document.createElement("div");
      studentTaskCard.className = `glass-card student-task-item ${isCompleted ? 'completed' : ''}`;
      studentTaskCard.id = `student-task-${data.id}`;
      
      let descImageHtml = "";
      if(data.descriptionImage && data.descriptionImage.trim() !== ""){
        descImageHtml = `<div style="margin-top:8px;"><img src="${data.descriptionImage}" style="max-width:100%; max-height:120px; border-radius:10px;"></div>`;
      }
      let descTextHtml = data.descriptionText ? `<p style="margin-top:6px; font-size:13px;">📄 ${data.descriptionText}</p>` : "";
      
      let validationSectionHtml = "";
      if (!isCompleted) {
        validationSectionHtml = `
          <div class="password-verif-box">
            <input type="text" id="pass-input-${data.id}" placeholder="Kode Guru..." maxlength="6">
            <button onclick="verifyTaskPassword(${data.id}, '${data.teacher}')">Centang</button>
          </div>
        `;
      } else {
        validationSectionHtml = `
          <div style="margin-top:5px; color:#4ade80; font-size:12px; font-weight:600;">
            <i class="ri-checkbox-circle-fill"></i> Selesai Terverifikasi (Terkunci)
          </div>
        `;
      }

      studentTaskCard.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${isCompleted ? 'checked' : ''} disabled style="cursor: not-allowed;">
        <div class="task-text-content">
          <h4>📝 ${data.task}</h4>
          <p style="font-size:13px; opacity:0.8;">Mapel: ${data.subject}</p>
          ${descTextHtml}
          ${descImageHtml}
          <small>📅 Deadline: ${data.deadline}</small>
          ${validationSectionHtml}
        </div>
      `;

      const containerId = "container_" + data.subject.replace(/ /g, '_').replace(/\(/g, '').replace(/\)/g, '');
      const container = document.getElementById(containerId);
      if(container) container.appendChild(studentTaskCard);
    }
  });

  updateChart();
}

function deleteTask(id){
  if(!currentUser) return;
  if(confirm("Apakah Anda yakin ingin menghapus tugas ini?")){
    const teacherKey = currentUser.username;
    tasks[teacherKey] = (tasks[teacherKey] || []).filter(t => t.id !== id);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
  }
}

function startEdit(id){
  if(!currentUser) return;
  const teacherKey = currentUser.username;
  const task = (tasks[teacherKey] || []).find(t => t.id === id);

  if(!task) return;

  editId = id;
  
  document.getElementById("subjectSelect").value = task.subject;
  document.getElementById("taskInput").value = task.task;
  document.getElementById("descText").value = task.descriptionText || "";
  if(task.descriptionImage){
    const preview = document.getElementById("descImagePreview");
    preview.src = task.descriptionImage;
    preview.style.display = "block";
  } else {
    document.getElementById("descImagePreview").style.display = "none";
  }
  document.getElementById("deadlineInput").value = task.deadline;
  
  const formTitle = document.querySelector(".teacher-form h3");
  const actionBtn = document.querySelector(".teacher-form button");
  
  if(formTitle) formTitle.innerHTML = `<span style="color: #facc15;"><i class="ri-edit-box-line"></i> Mode Edit: Mengubah Tugas</span>`;
  if(actionBtn) {
    actionBtn.innerText = "✏️ Simpan Perubahan Tugas";
    actionBtn.style.background = "linear-gradient(to right, #facc15, #eab308)";
    actionBtn.style.color = "black";
  }

  if(!document.getElementById("cancelEditBtn")){
    const cancelBtn = document.createElement("button");
    cancelBtn.id = "cancelEditBtn";
    cancelBtn.type = "button";
    cancelBtn.innerText = "❌ Batal Mengedit";
    cancelBtn.style.background = "rgba(255,255,255,0.15)";
    cancelBtn.style.marginTop = "10px";
    cancelBtn.onclick = resetTeacherForm;
    actionBtn.parentNode.insertBefore(cancelBtn, actionBtn.nextSibling);
  }
  
  document.getElementById("subjectSelect").scrollIntoView({ behavior: 'smooth' });
}

function resetTeacherForm(){
  editId = null;
  
  document.getElementById("subjectSelect").value = "";
  document.getElementById("taskInput").value = "";
  document.getElementById("descText").value = "";
  document.getElementById("descImageInput").value = "";
  document.getElementById("descImagePreview").style.display = "none";
  document.getElementById("deadlineInput").value = "";
  
  const formTitle = document.querySelector(".teacher-form h3");
  const actionBtn = document.querySelector(".teacher-form button");
  
  if(formTitle) formTitle.innerHTML = "➕ Tambah Tugas";
  if(actionBtn) {
    actionBtn.innerText = "Tambahkan Tugas";
    actionBtn.style.background = "rgba(255, 255, 255, 0.25)";
    actionBtn.style.color = "white";
  }

  const cancelBtn = document.getElementById("cancelEditBtn");
  if(cancelBtn) cancelBtn.remove();
}

function updateChart(){
  const dates = {
    "25 Mei 2026": 0,
    "26 Mei 2026": 0,
    "27 Mei 2026": 0,
    "28 Mei 2026": 0,
    "29 Mei 2026": 0,
    "30 Mei 2026": 0
  };

  const studentKey = currentUser ? currentUser.username : "";
  const userCheckedList = (currentUser && currentUser.role === "student") ? (checkedTasks[studentKey] || []) : [];

  Object.keys(tasks).forEach(teacher => {
    if(Array.isArray(tasks[teacher])){
      tasks[teacher].forEach(t => {
        if(dates[t.deadline] !== undefined && !userCheckedList.includes(t.id)){
          dates[t.deadline]++;
        }
      });
    }
  });

  const bars = document.querySelectorAll(".bar");
  Object.values(dates).forEach((total, i) => {
    if(!bars[i]) return;
    bars[i].style.height = (total * 35) + "px";
    bars[i].querySelector("span").innerText = total;
  });
}
