# Contact navigation E2E audit (shell independent v13)

Files scanned: 126
Contact-related hrefs found: 3
Contact files explicitly checked: app/contact/page.tsx, features/landing-page/rack-01/rack-01.tsx, features/layout/components/footer.tsx

- [PASS] features/landing-page/components/hero-section.tsx: https://drive.google.com/file/d/17x3GuEkZxbt9ZeLilXx1ShBHV_CZTfSq/view?usp=sharing
- [PASS] features/layout/components/footer.tsx: mailto:adityahimaone@gmail.com
- [PASS] features/projects/views/projects-page.tsx: https://github.com/adityahimaone

Check GitHub present: PASS
Check LinkedIn present: FAIL
Check X present: FAIL
Check mailto present: PASS
Check Resume/Drive present: PASS
Check no empty/dead href: PASS

Overall static href status: PASS
Browser pixel visibility/clickability: NOT VERIFIED (direct shell executor, no browser provider)
No email/API submission performed.

Commands executed:
- rg href scan via python re
- python pathlib glob
- command -v bash; command -v rtk; pwd

