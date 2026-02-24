@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

echo 开始构建 editorjs-alert...
echo.

if not exist "node_modules\webpack" (
    echo 未检测到 node_modules 或 webpack 依赖，先执行 npm install ...
    call npm install
    set INSTALL_RESULT=!ERRORLEVEL!
    if !INSTALL_RESULT! NEQ 0 (
        echo npm install 失败！错误代码: !INSTALL_RESULT!
        echo.
        if /I "%~1" NEQ "--no-pause" (
            pause
        )
        exit /b !INSTALL_RESULT!
    )
    echo npm install 完成
    echo.
)

call npm run build
set BUILD_RESULT=!ERRORLEVEL!

echo.
echo 构建完成，返回码: !BUILD_RESULT!

if !BUILD_RESULT! NEQ 0 (
    echo 构建失败！错误代码: !BUILD_RESULT!
    echo.
    if /I "%~1" NEQ "--no-pause" (
        pause
    )
    exit /b !BUILD_RESULT!
)

echo 构建成功，开始复制文件...
echo.

set SRC_FILE=dist\bundle.js
set DEST_DIR=..\..\QNotes\public\vendor\editorjs-alert
set DEST_FILE=%DEST_DIR%\editorjs-alert.bundle.js

if not exist "!SRC_FILE!" (
    echo 错误：找不到 !SRC_FILE! 文件！
    echo 请先确认 npm run build 能在 dist 下生成 bundle.js
    echo.
    if /I "%~1" NEQ "--no-pause" (
        pause
    )
    exit /b 1
)

echo 源文件存在: !SRC_FILE!

if not exist "!DEST_DIR!" (
    echo 创建目标目录: !DEST_DIR!
    mkdir "!DEST_DIR!"
    set MKDIR_RESULT=!ERRORLEVEL!
    if !MKDIR_RESULT! NEQ 0 (
        echo 创建目录失败！错误代码: !MKDIR_RESULT!
        echo.
        if /I "%~1" NEQ "--no-pause" (
            pause
        )
        exit /b !MKDIR_RESULT!
    )
    echo 目标目录创建成功
)

echo 正在复制文件到: !DEST_FILE!
copy /Y "!SRC_FILE!" "!DEST_FILE!"
set COPY_RESULT=!ERRORLEVEL!

if !COPY_RESULT! EQU 0 (
    echo 文件复制成功！
) else (
    echo 文件复制失败！错误代码: !COPY_RESULT!
    echo.
    if /I "%~1" NEQ "--no-pause" (
        pause
    )
    exit /b !COPY_RESULT!
)

echo.
echo ========================================
echo 完成！已生成并复制 editorjs-alert.bundle.js
echo 目标路径: !DEST_FILE!
echo ========================================

if /I "%~1" NEQ "--no-pause" (
    pause
)

exit /b 0

