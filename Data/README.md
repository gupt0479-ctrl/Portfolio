# Sanity Portfolio Local Fallback Data

This folder contains Anant Gupta portfolio seed data and the local development fallback used by `src/lib/localContent.ts`. The files are structured in NDJSON (Newline Delimited JSON) format, which is the standard format for Sanity data imports.

In development, the portfolio reads these files unless `PORTFOLIO_CONTENT_SOURCE=sanity` is set. Keep runtime fallback files aligned with the real portfolio content.

## 📦 What's Included

The following data files are available for import:

| File | Description | Records |
|------|-------------|---------|
| `profile.ndjson` | Main profile information | 1 profile |
| `skills.ndjson` | Technical skills and proficiencies | 15 skills |
| `experience.ndjson` | Work experience history | 4 positions |
| `education.ndjson` | Educational background | 2 degrees |
| `projects.ndjson` | Portfolio projects | 6 projects |
| `blog.ndjson` | Blog posts | 6 articles |
| `achievements.ndjson` | Awards and achievements | 7 achievements |
| `certifications.ndjson` | Professional certifications | 5 certifications |
| `navigation.ndjson` | Navigation links | 10 links |
| `siteSettings.ndjson` | Site configuration | 1 settings document |

**Total: 46 seed documents** for local fallback or Sanity import.

## ⚠️ Important: Singleton Documents

Two documents are configured as **singletons** (only one instance allowed):
- **Profile** - Uses ID: `singleton-profile`
- **Site Settings** - Uses ID: `singleton-siteSettings`

These IDs match your `structure.ts` configuration and allow proper singleton behavior in Sanity Studio.

## 🚀 Quick Start - Import All Data

### Prerequisites

Before importing, ensure you have:

1. ✅ Sanity CLI installed globally (if not, run: `npm install -g @sanity/cli`)
2. ✅ Your environment variables set up (`.env` or `.env.local` file)
3. ✅ Your Sanity project is initialized and accessible

### Environment Variables

Make sure these variables are set in your `.env.local` file:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

### Method 1: Import All Data at Once (Recommended)

Import all data files in the correct order to handle references properly:

```bash
# Navigate to the Data folder
cd Data

# Use your configured dataset, defaulting to production
DATASET=${NEXT_PUBLIC_SANITY_DATASET:-production}

# Import in order (skills first, then items that reference them)
sanity dataset import skills.ndjson "$DATASET" --replace
sanity dataset import profile.ndjson "$DATASET" --replace
sanity dataset import education.ndjson "$DATASET" --replace
sanity dataset import experience.ndjson "$DATASET" --replace
sanity dataset import projects.ndjson "$DATASET" --replace
sanity dataset import blog.ndjson "$DATASET" --replace
sanity dataset import achievements.ndjson "$DATASET" --replace
sanity dataset import certifications.ndjson "$DATASET" --replace
sanity dataset import navigation.ndjson "$DATASET" --replace
sanity dataset import siteSettings.ndjson "$DATASET" --replace
```

**Note:** Replace `production` with your dataset name if different (e.g., `development`, `staging`).

### Method 2: Import Using One Command

You can also use this one-liner to import all files sequentially:

```bash
# From the project root
cd Data && DATASET=${NEXT_PUBLIC_SANITY_DATASET:-production}; for file in skills.ndjson profile.ndjson education.ndjson experience.ndjson projects.ndjson blog.ndjson achievements.ndjson certifications.ndjson navigation.ndjson siteSettings.ndjson; do sanity dataset import "$file" "$DATASET" --replace; done
```

### Method 3: Import Specific Files Only

If you only want to import specific content types:

```bash
# From the Data folder
cd Data

# Import only skills and projects
sanity dataset import skills.ndjson "$DATASET" --replace
sanity dataset import projects.ndjson "$DATASET" --replace

# Or import only blog posts
sanity dataset import blog.ndjson "$DATASET" --replace
```

## 📋 Import Command Options

### Basic Import (Replace Mode)
```bash
sanity dataset import <filename>.ndjson <dataset-name> --replace
```
The `--replace` flag will overwrite documents with matching `_id` values.

### Import Without Replacing
```bash
sanity dataset import <filename>.ndjson <dataset-name>
```
This will skip documents that already exist (based on `_id`).

### Import to Different Dataset
```bash
# Import to development dataset
sanity dataset import skills.ndjson development --replace

# Import to staging dataset
sanity dataset import profile.ndjson staging --replace
```

### Missing Documents Mode
```bash
sanity dataset import <filename>.ndjson <dataset-name> --missing
```
Only import documents that don't exist in the dataset.

## 🔄 Order of Import (Important!)

The import order matters because some documents reference others. Follow this order:

1. **Skills** - Must be imported first (referenced by projects, experience, etc.)
2. **Profile** - Main profile data
3. **Education** - Educational background
4. **Experience** - Work history (references skills)
5. **Projects** - Portfolio projects (references skills)
6. **Blog** - Blog posts (references profile as author)
7. **Achievements** - Awards and recognitions
8. **Certifications** - Professional certifications (references skills)
9. **Navigation** - Section links and external destinations
10. **Site Settings** - Site configuration

## 🎨 Customizing the Data

### Before Importing

You can customize the seed data before importing:

1. Open any `.ndjson` file in a text editor
2. Modify the values (name, email, descriptions, etc.)
3. Keep the structure intact (don't modify `_type`, `_id`, or reference structures)
4. Save and import

### Example: Updating Profile Data

Edit `profile.ndjson` and change:
```json
"firstName":"John" → "firstName":"YourName"
"email":"john.doe@example.com" → "email":"your.email@example.com"
```

### Example: Updating Site Settings

Edit `siteSettings.ndjson` and change:
```json
"siteTitle":"Anant Gupta - Portfolio" → "siteTitle":"Your Name - Developer"
"primaryColor":"#3B82F6" → "primaryColor":"#YourColor"
```

## 🖼️ Note About Images

The seed data includes image fields but **no actual image files**. After importing, you'll need to:

1. Go to your Sanity Studio (usually at `http://localhost:3000/studio`)
2. Navigate to each document type
3. Upload images for:
   - Profile image
   - Project cover images
   - Blog featured images
   - Company logos
   - Skill icons
   - etc.

## 🧹 Cleaning Up / Starting Fresh

### Delete All Data from a Dataset
```bash
# ⚠️ WARNING: This deletes ALL documents in the dataset
sanity dataset delete production

# Create the dataset again
sanity dataset create production
```

### Delete Specific Document Types

Use the Sanity Studio Vision tool or API to delete specific types:

```groq
// In Vision tool, run this query to find documents
*[_type == "blog"]

// Then delete them manually or use the API
```

## 🔍 Verify Import Success

After importing, verify your data:

### Method 1: Using Sanity Studio
1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000/studio`
3. Navigate through different document types to verify data

### Method 2: Using Vision (GROQ Playground)
1. Go to your Sanity Studio
2. Open the Vision tab
3. Run queries to verify:

```groq
// Count all documents
count(*[])

// Count specific type
count(*[_type == "project"])

// View all skills
*[_type == "skill"]{name, category, proficiency}

// View featured projects
*[_type == "project" && featured == true]{title, tagline}
```

## 📊 Data Statistics

After successful import, you should have:

- ✅ 1 complete profile with bio and contact info
- ✅ 15 diverse skills across multiple categories
- ✅ 4 work experiences with detailed descriptions
- ✅ 2 educational qualifications
- ✅ 6 portfolio projects with descriptions and tech stacks
- ✅ 6 blog posts across different categories
- ✅ 7 achievements and awards
- ✅ 5 professional certifications
- ✅ 10 navigation links across portfolio sections and socials
- ✅ 1 site settings configuration
- ✅ 3 sample contact submissions

## 🛠️ Troubleshooting

### Issue: "Command not found: sanity"

**Solution:** Install Sanity CLI globally
```bash
npm install -g @sanity/cli
```

### Issue: "Unable to find project"

**Solution:** Make sure your environment variables are set correctly
```bash
# Check your .env.local file has:
NEXT_PUBLIC_SANITY_PROJECT_ID=your-actual-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

### Issue: "Authentication required"

**Solution:** Login to Sanity CLI
```bash
sanity login
```

### Issue: "Dataset not found"

**Solution:** Create the dataset first
```bash
sanity dataset create production
```

### Issue: References not working

**Solution:** Import files in the correct order (skills first, then documents that reference them)

### Issue: "Document validation failed"

**Solution:** Check your schema definitions match the data structure. Run:
```bash
npm run typegen
```

## 🎯 Next Steps After Import

1. **Upload Images**: Add real images to all documents with image fields
2. **Customize Content**: Update the seed content with your actual information
3. **Test Your Frontend**: Verify that your Next.js app fetches and displays the data correctly
4. **Set References**: Check that all references (e.g., blog author, project technologies) are properly connected
5. **Publish Documents**: If using draft/publish workflow, publish the documents you want visible

## 📚 Additional Resources

- [Sanity CLI Documentation](https://www.sanity.io/docs/cli)
- [Sanity Import/Export Guide](https://www.sanity.io/docs/import-data)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Sanity Schema Types](https://www.sanity.io/docs/schema-types)

## 💡 Tips

1. **Backup First**: Before importing to a production dataset, consider creating a backup
2. **Test in Development**: Import to a development dataset first to test
3. **Version Control**: Keep these data files in version control for team collaboration
4. **Customize Gradually**: Import base data, then customize piece by piece
5. **Use Vision**: The Vision tool is invaluable for testing queries and viewing data

## 🆘 Need Help?

If you encounter any issues:

1. Check the [Sanity Documentation](https://www.sanity.io/docs)
2. Visit [Sanity's Community Slack](https://slack.sanity.io/)
3. Review the error messages carefully - they usually indicate the exact problem
4. Ensure your schema definitions match the data structure

---

**Happy importing! 🚀**

Once imported, your Sanity Studio will be fully populated with professional-looking portfolio data that you can customize to match your actual experience and projects.
