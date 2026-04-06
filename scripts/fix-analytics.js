const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/knaan/.gemini/FinFlow-Finance tracker for teens-2.0';

const analyticsPath = path.join(dir, 'app/analytics/page.tsx');
let content = fs.readFileSync(analyticsPath, 'utf8');

// Fix Income vs Expenses chart - improve Y-axis formatting and add radius
content = content.replace(
  '<YAxis stroke="#ffffff30" fontSize={10} tickFormatter={(v) => `$${v}`} />',
  '<YAxis stroke="#ffffff30" fontSize={10} tickFormatter={(v) => v >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v}`} />'
);

content = content.replace(
  '<Bar dataKey="income" fill="#00C896" name="Income" />',
  '<Bar dataKey="income" fill="#00C896" name="Income" radius={[4, 4, 0, 0]} />'
);

content = content.replace(
  '<Bar dataKey="expense" fill="#FF6B6B" name="Expenses" />',
  '<Bar dataKey="expense" fill="#FF6B6B" name="Expenses" radius={[4, 4, 0, 0]} />'
);

// Add formatter to Tooltip
content = content.replace(
  '<Tooltip />',
  '<Tooltip formatter={(value) => formatCurrency(convert(value), currency)} />'
);

fs.writeFileSync(analyticsPath, content);
console.log('Analytics charts refined');
