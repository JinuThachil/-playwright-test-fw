const { test, expect } = require('@playwright/test');

test.describe('YouTube Tags Capture', () => {
  test('should capture all tags listed on YouTube home page', async ({ page, browser }) => {
    // Step 1: Open browser (already done by Playwright)
    console.log('Browser opened successfully');

    // Step 2: Navigate to YouTube
    console.log('Navigating to YouTube...');
    await page.goto('https://www.youtube.com', {
      waitUntil: 'networkidle',
    });

    // Wait for page to load completely
    await page.waitForLoadState('domcontentloaded');
    console.log('YouTube home page loaded');

    // Step 3: Capture all tags
    console.log('Capturing all tags from the home page...');

    // Get all tag elements (tags typically appear in various selectors on YouTube)
    const tags = await page.locator('[aria-label*="tag"], a[href*="/results?search_query="], .yt-simple-endpoint').all();

    console.log(`Found ${tags.length} elements`);

    // Alternative approach: Get all links and filter for tag-like content
    const allLinks = await page.locator('a').all();
    const tagSet = new Set();

    for (const link of allLinks) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();

      // Capture various types of tags/labels
      if (href && text && text.trim().length > 0 && text.trim().length < 50) {
        tagSet.add({
          text: text.trim(),
          href: href,
        });
      }
    }

    const capturedTags = Array.from(tagSet);

    console.log('='.repeat(60));
    console.log('CAPTURED TAGS FROM YOUTUBE HOME PAGE:');
    console.log('='.repeat(60));

    capturedTags.forEach((tag, index) => {
      console.log(`${index + 1}. ${tag.text} (URL: ${tag.href})`);
    });

    console.log('='.repeat(60));
    console.log(`Total tags captured: ${capturedTags.length}`);
    console.log('='.repeat(60));

    // Assertion: Verify that we captured some tags
    expect(capturedTags.length).toBeGreaterThan(0);

    // Save captured tags to a JSON file for later reference
    const fs = require('fs');
    const path = require('path');

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
  });

  test('should capture trending section tags', async ({ page }) => {
    console.log('Starting trending section tags capture test...');

    // Navigate to YouTube
    await page.goto('https://www.youtube.com', {
      waitUntil: 'networkidle',
    });

    // Scroll down to see more content
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(2000);

    // Capture all span elements that might contain tags/labels
    const spanTexts = await page.locator('span').allTextContents();

    // Filter for relevant tags (exclude very short or very long text)
    const relevantTags = spanTexts
      .filter((text) => text.length > 3 && text.length < 100)
      .map((text) => text.trim())
      .filter((text) => text.length > 0);

    // Remove duplicates
    const uniqueTags = [...new Set(relevantTags)];

    console.log(`Captured ${uniqueTags.length} unique tags from spans`);

    // Store results
    expect(uniqueTags.length).toBeGreaterThan(0);
  });
});
