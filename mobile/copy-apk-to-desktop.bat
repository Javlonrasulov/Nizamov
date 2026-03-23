@echo off
set APK_SRC=%~dp0android\app\build\outputs\apk\debug\app-debug.apk
set APK_DEST=%USERPROFILE%\Desktop\Sainur-CRM-1.0.1-19.03.2026.apk
if exist "%APK_SRC%" (
  copy /Y "%APK_SRC%" "%APK_DEST%"
  echo APK Desktop ga nusxalandi: %APK_DEST%
) else (
  echo APK topilmadi. Avval build qiling: npm run apk
  echo Yoki Android Studio da Build -^> Build APK
)
