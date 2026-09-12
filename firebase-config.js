// ============================================================
// اسعفني — إعدادات Firebase (ربط متعدد الأجهزة: المستخدم ← المسعف ← NFC)
// ============================================================
// 1) أنشئ مشروعاً مجانياً على https://console.firebase.google.com
// 2) من «Realtime Database» أنشئ قاعدة بيانات وضع «الاختبار»:
//        {
//          "rules": { ".read": "true", ".write": "true" }
//        }
// 3) انسخ كائن الإعدادات من «إعدادات المشروع ← تطبيقاتك ← على الويب</>»
//    وضع القيم أدناه. تُشحن هذه الصفحات الثلاث معاً،
//    وتتناسق الحالات فورياً على كل الأجهزة عبر Firebase.
// ملاحظة: apiKey عام بطبيعته وليس سراً — الحماية تكون بقواعد قاعدة البيانات.
// ============================================================

window.FIREBASE_CONFIG={
  apiKey:'AIzaSyDx8uBu_UpsITEARxWO0n9gL6hnMTkFdac',
  authDomain:'asafni-dcc3a.firebaseapp.com',
  databaseURL:'https://asafni-dcc3a-default-rtdb.europe-west1.firebasedatabase.app',
  projectId:'asafni-dcc3a',
  storageBucket:'asafni-dcc3a.firebasestorage.app',
  messagingSenderId:'105147915127',
  appId:'1:105147915127:web:cb9bfc7d8dfbc34cc81f72',
  measurementId:'G-5DHKW0K2T9'
};