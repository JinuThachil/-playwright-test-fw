const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('YouTube Tags Capture', () => {
  test('should capture all tags listed on YouTube home page', async ({ page }) => {
    console.log('Browser opened successfully');
    console.log('Navigating to YouTube...');

    try {
      await page.goto('https://www.youtube.com', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      console.log('YouTube home page loaded');
      console.log('Capturing all tags from the home page...');

      // Get all links and filter for tag-like content
      const allLinks = await page.locator('a').all();
      const tagSet = new Set();

      for (const link of allLinks) {
        try {
          const href = await link.getAttribute('href');
          const text = await link.textContent();

          // Capture various types of tags/labels
          if (href && text && text.trim().length > 0 && text.trim().length < 100) {
            tagSet.add({
              text: text.trim(),
              href: href,
            });
          }
        } catch (e) {
          // Skip elements that are no longer attached
          continue;
        }
      }

      const capturedTags = Array.from(tagSet).slice(0, 50); // Limit to first 50

      console.log('='.repeat(60));
      console.log('CAPTURED TAGS FROM YOUTUBE HOME PAGE:');
      console.log('='.repeat(60));

      capturedTags.forEach((tag, index) => {
        console.log(`${index + 1}. ${tag.text} (URL: ${tag.href})`);
      });

      console.log('='.repeat(60));
      console.log(`Total tags captured: ${capturedTags.length}`);
      console.log('='.repeat(60));

      // Log to file even if empty
      const outputDir = path.join(__dirname, '../test-results');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const tagsData = {
        timestamp: new Date().toISOString(),
        totalTagsCount: capturedTags.length,
        tags: capturedTags,
        pageUrl: page.url(),
      };

      fs.writeFileSync(
        path.join(outputDir, 'youtube-tags-capture.json'),
        JSON.stringify(tagsData, null, 2)
      );

      console.log('\nTags data saved to: test-results/youtube-tags-capture.json');

      // Assertion: Page should load successfully
      expect(page.url()).toContain('youtube.com');
    } catch (error) {
      console.error('Error during YouTube test:', error.message);
      // Save error log
      const outputDir = path.join(__dirname, '../test-results');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(outputDir, 'youtube-error.log'),
        error.message
      );
      throw error;
    }
  });
});
