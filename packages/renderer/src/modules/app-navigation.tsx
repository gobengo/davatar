import type { ElectronApplication } from "playwright-core";

export class AppNavigationPageController {
    public async navigate(app: ElectronApplication, href: string) {
        await app.evaluate(async (E, [href]) => {
            const mainWindow = E.BrowserWindow.getAllWindows()[0];
            mainWindow.webContents.send('davatar', {
                type: 'Navigate',
                payload: {
                    href,
                },
            });
        }, [href]);
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
}
