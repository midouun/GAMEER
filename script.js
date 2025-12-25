// تعريف العناصر
const car = document.getElementById('playerCar');
const gameArea = document.getElementById('gameArea');

// أزرار التحكم
const btnGas = document.getElementById('btnGas');
const btnBrake = document.getElementById('btnBrake');
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');

// متغيرات الفيزياء (لجعلها واقعية)
let state = {
    x: gameArea.clientWidth / 2, // الموقع الأفقي
    y: gameArea.clientHeight / 2, // الموقع العمودي
    angle: 0,      // زاوية الدوران (بالدرجات)
    speed: 0,      // السرعة الحالية
    maxSpeed: 10,  // السرعة القصوى
    acceleration: 0.2, // قوة التسارع
    friction: 0.96, // الاحتكاك (لإبطاء السيارة تدريجياً)
    turnSpeed: 4    // سرعة الانعطاف
};

// حالة المفاتيح (هل الزر مضغوط أم لا؟)
let keys = {
    gas: false,
    brake: false,
    left: false,
    right: false
};

// --- التعامل مع الأحداث (اللمس والماوس) ---
function setKey(key, value) {
    keys[key] = value;
}

// دالة لربط الأزرار بالأحداث
function bindButton(btn, keyName) {
    // للأجهزة اللمسية
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); setKey(keyName, true); });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); setKey(keyName, false); });
    
    // للماوس (الكمبيوتر)
    btn.addEventListener('mousedown', () => setKey(keyName, true));
    btn.addEventListener('mouseup', () => setKey(keyName, false));
    btn.addEventListener('mouseleave', () => setKey(keyName, false));
}

bindButton(btnGas, 'gas');
bindButton(btnBrake, 'brake');
bindButton(btnLeft, 'left');
bindButton(btnRight, 'right');

// --- حلقة اللعبة (Game Loop) ---
// هذه الدالة تعمل 60 مرة في الثانية لتحديث الشاشة
function update() {
    
    // 1. حساب السرعة
    if (keys.gas) {
        state.speed += state.acceleration;
    } else {
        // إذا لم نضغط بنزين، السيارة تتباطأ بسبب الاحتكاك
        state.speed *= state.friction;
    }

    if (keys.brake) {
        state.speed -= 0.5; // الفرامل أقوى من الاحتكاك الطبيعي
    }

    // تحديد الحد الأقصى للسرعة
    if (state.speed > state.maxSpeed) state.speed = state.maxSpeed;
    if (state.speed < -state.maxSpeed / 2) state.speed = -state.maxSpeed / 2; // سرعة الرجوع للخلف أبطأ
    
    // إيقاف السيارة تماماً إذا كانت السرعة صغيرة جداً
    if (Math.abs(state.speed) < 0.05) state.speed = 0;

    // 2. حساب الدوران
    // لا يمكن للسيارة الدوران إذا كانت واقفة
    if (Math.abs(state.speed) > 0.1) {
        // عكس اتجاه الدوران عند الرجوع للخلف لواقعية أكثر
        const turnFactor = (state.speed > 0) ? 1 : -1;
        
        if (keys.left) {
            state.angle -= state.turnSpeed * turnFactor;
        }
        if (keys.right) {
            state.angle += state.turnSpeed * turnFactor;
        }
    }

    // 3. تحديث الموقع (رياضيات المتجهات)
    // تحويل الزاوية من درجات إلى راديان
    const rad = (state.angle - 90) * (Math.PI / 180);
    
    state.x += state.speed * Math.cos(rad);
    state.y += state.speed * Math.sin(rad);

    // 4. حدود الشاشة (لكي لا تخرج السيارة)
    // نستخدم "التكرار" (تخرج من اليمين تدخل من اليسار) أو "الجدران". هنا سنستخدم الجدران.
    const carW = 50; 
    const carH = 80;
    const areaW = gameArea.clientWidth;
    const areaH = gameArea.clientHeight;

    if (state.x < 0) state.x = 0;
    if (state.x > areaW - carW) state.x = areaW - carW;
    if (state.y < 0) state.y = 0;
    if (state.y > areaH - carH) state.y = areaH - carH;

    // 5. الرسم (تطبيق القيم على العنصر)
    car.style.transform = `translate(${state.x}px, ${state.y}px) rotate(${state.angle}deg)`;

    // طلب الإطار التالي
    requestAnimationFrame(update);
}

// بدء اللعبة
update();
