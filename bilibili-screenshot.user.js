// ==UserScript==
// @name         哔哩哔哩辅助截屏
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  为B站视频添加截屏功能
// @author       d0ublecl1ck
// @match        https://www.bilibili.com/video/*
// @icon         https://static.hdslb.com/mobile/img/512.png
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // 等待视频控制栏加载完成
    function waitForElement(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    // 默认快捷键
    const DEFAULT_HOTKEY = 'S';
    
    // 获取保存的快捷键或使用默认值
    let screenshotHotkey = GM_getValue('screenshotHotkey', DEFAULT_HOTKEY);

    // 创建设置面板样式
    const style = document.createElement('style');
    style.textContent = `
        .screenshot-settings {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            z-index: 999999;
            display: none;
        }
        .screenshot-settings.show {
            display: block;
        }
        .screenshot-settings input {
            margin: 10px 0;
            padding: 5px;
        }
        .screenshot-settings button {
            margin: 5px;
            padding: 5px 10px;
            cursor: pointer;
        }
        .screenshot-toast {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 999999;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .screenshot-toast.show {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    // 创建设置面板
    function createSettingsPanel() {
        const panel = document.createElement('div');
        panel.className = 'screenshot-settings';
        panel.innerHTML = `
            <h3>截图设置</h3>
            <div>
                <label>快捷键: </label>
                <input type="text" id="hotkey-input" value="${screenshotHotkey}" readonly>
                <p>点击输入框后按下想要设置的按键</p>
            </div>
            <button id="save-settings">保存</button>
            <button id="cancel-settings">取消</button>
        `;
        document.body.appendChild(panel);

        // 快捷键输入处理
        const hotkeyInput = panel.querySelector('#hotkey-input');
        hotkeyInput.addEventListener('keydown', (e) => {
            e.preventDefault();
            hotkeyInput.value = e.key.toUpperCase();
        });

        // 保存设置
        panel.querySelector('#save-settings').addEventListener('click', () => {
            screenshotHotkey = hotkeyInput.value;
            GM_setValue('screenshotHotkey', screenshotHotkey);
            panel.classList.remove('show');
        });

        // 取消设置
        panel.querySelector('#cancel-settings').addEventListener('click', () => {
            hotkeyInput.value = screenshotHotkey;
            panel.classList.remove('show');
        });

        return panel;
    }

    // 创建截图按钮
    function createScreenshotButton() {
        const button = document.createElement('div');
        button.className = 'bpx-player-ctrl-btn';
        button.innerHTML = `
            <div class="bpx-player-ctrl-btn-icon">
                <span class="bpx-common-svg-icon">
                    <svg viewBox="0 0 22 22">
                        <path fill="#ffffff" d="M16,4h-2.5C13,2,11.5,1,10.5,1h-3C6.5,1,5,2,4.5,4H2C0.9,4,0,4.9,0,6v12c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V6
                        C18,4.9,17.1,4,16,4z M9,3h2c0.6,0,1,0.4,1,1c0,0.6-0.4,1-1,1H9C8.4,5,8,4.6,8,4C8,3.4,8.4,3,9,3z M9,13c-1.7,0-3-1.3-3-3s1.3-3,3-3
                        s3,1.3,3,3S10.7,13,9,13z"/>
                    </svg>
                </span>
            </div>
        `;
        button.style.cursor = 'pointer';
        button.setAttribute('role', 'button');
        button.setAttribute('aria-label', '截屏');
        button.setAttribute('tabindex', '0');
        
        // 添加右键菜单事件
        button.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            settingsPanel.classList.add('show');
        });
        
        button.addEventListener('click', takeScreenshot);
        return button;
    }

    // 创建提示框函数
    function showToast(message, duration = 1000) {
        const toast = document.createElement('div');
        toast.className = 'screenshot-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // 显示提示
        setTimeout(() => {
            toast.classList.add('show');
        }, 0);

        // 延迟后隐藏并移除提示
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, duration);
    }

    // 截图功能实现
    function takeScreenshot() {
        const video = document.querySelector('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 获取当前视频时间戳
        const currentTime = video.currentTime;
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        const timestamp = `${minutes.toString().padStart(2, '0')}-${seconds.toString().padStart(2, '0')}`;

        // 创建下载链接
        const link = document.createElement('a');
        link.download = `bilibili-screenshot-${timestamp}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // 显示提示
        showToast('截图已保存');
    }

    // 添加快捷键监听
    document.addEventListener('keydown', (e) => {
        if (e.key.toUpperCase() === screenshotHotkey) {
            takeScreenshot();
        }
    });

    // 创建设置面板
    const settingsPanel = createSettingsPanel();

    // 主函数
    async function init() {
        // 等待视频控制栏加载
        const controlBar = await waitForElement('.bpx-player-control-bottom-left');
        if (!controlBar) return;

        // 插入截图按钮
        const screenshotButton = createScreenshotButton();
        controlBar.appendChild(screenshotButton);
    }

    // 页面加载完成后初始化
    window.addEventListener('load', init);
})(); 