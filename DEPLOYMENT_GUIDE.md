# How to Update Your Website

Since you are using **GitHub Desktop**, here is the easiest workflow to update your site.

## Step 1: Add Project to GitHub Desktop
1. Open GitHub Desktop.
2. Go to `File` > `Add Local Repository...`
3. Click `Choose...` and select your project folder: `f:\Test Antigravity`
4. Click `Add Repository`.

## Step 2: Making Changes
1. Open your code editor (like VS Code) and make your changes.
2. Save your files.

## Step 3: Save Changes (Commit & Push)
1. Open GitHub Desktop. You will see your changed files in the left list.
2. In the bottom left box (**Summary**), type a short name for your change (e.g., "Updated calendar colors").
3. Click the blue **Commit to main** button.
4. Click **Push origin** in the top bar to save your code to GitHub.

## Step 4: Update the Live Website
**Important:** Pushing code to GitHub only saves it. to update the specific **live website link**, you must run one command:

1. Open your terminal (in VS Code or elsewhere).
2. Run this command:
   ```bash
   npm run deploy
   ```
3. Wait for it to say `Published`. Use your browser to visit the link!

---
*Note: If you want `npm run deploy` to happen automatically whenever you push, ask me to "Set up GitHub Actions for auto-deployment".*
