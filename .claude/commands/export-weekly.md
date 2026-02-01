# Export Weekly Summary Command

Export the last 7 days of nutrition data for patrikdrean@gmail.com.

## Instructions

Run the following command in the backend directory:

```bash
cd backend && npm run export:daily -- --email patrikdrean@gmail.com --days 7
```

This will output:
- Daily nutrition summaries (calories, protein, carbs, fat) for the last 7 days
- Summary statistics including averages

To save to a file, add `--output filename.csv`:
```bash
cd backend && npm run export:daily -- --email patrikdrean@gmail.com --days 7 --output weekly-report.csv
```
