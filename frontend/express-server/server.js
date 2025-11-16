const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000; // Use PORT from environment or default to 5000

// Serve static files from the React app
const buildPath = path.join(__dirname, 'build');
console.log(buildPath)
app.use(express.static(buildPath));

// Handle React routing, return all requests to React's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});