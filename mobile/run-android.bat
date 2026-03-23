@echo off
REM Avval build va sync
call npm run build
call npx cap sync android

REM JAVA_HOME bo'lsa Gradle orqali ishga tushirish
if defined JAVA_HOME (
  cd android
  call gradlew installDebug
  cd ..
  echo.
  echo Ilova emulator/qurilma ga o'rnatildi. Ilovani qo'lda oching yoki Android Studio dan Run bosing.
) else (
  echo.
  echo JAVA_HOME o'rnatilmagan. Android Studio da oching:
  echo   1. Android Studio ni oching
  echo   2. File - Open - mobile\android papkasini tanlang
  echo   3. Run (yashil tugma) bosing
  echo.
  start "" "android"
)
