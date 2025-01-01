import React from 'react';
import './styles.css';

function App() {
    const [currentControlVersion, setControlVersion] = React.useState('');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];

        if (currentTab && currentTab.url) {
            // Fetch cookies only for the current tab's URL
            chrome.cookies.getAll({ url: currentTab.url }, (cookies) => {
                const controlVersion =
                    cookies.find((cookie) => cookie.name === 'control_version')
                        ?.value ?? '';
                setControlVersion(controlVersion); // Your function to handle the control version
            });
        }
    });

    const joinClassNames = (...args: (string | boolean)[]): string => {
        return args.filter(Boolean).join(' ');
    };

    const handleVersionChange = (version: string) => {
        if (version === currentControlVersion) {
            return;
        }
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (tab && tab.id) {
                chrome?.scripting?.executeScript?.({
                    target: {
                        tabId: tab.id,
                        allFrames: false,
                    },
                    func: (controlVersion: string) => {
                        const cookieName = 'control_version';
                        const cookieValue = controlVersion;
                        const path = '/';

                        document.cookie = `${cookieName}=${cookieValue}; path=${path};`;
                        location.reload();
                    },
                    args: [version],
                });
                close();
            }
        });
    };

    return (
        <div style={{ display: 'flex', gap: 10, padding: 2 }}>
            <button
                onClick={() => handleVersionChange('default')}
                className={joinClassNames(
                    'button',
                    currentControlVersion === 'default' && 'selected'
                )}
            >
                Default
            </button>
            <button
                onClick={() => handleVersionChange('next')}
                className={joinClassNames(
                    'button',
                    currentControlVersion === 'next' && 'selected'
                )}
            >
                Next
            </button>
            <button
                onClick={() => handleVersionChange('later')}
                className={joinClassNames(
                    'button',
                    currentControlVersion === 'later' && 'selected'
                )}
            >
                Later
            </button>
        </div>
    );
}

export default App;
