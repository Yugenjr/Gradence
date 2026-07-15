function doGet() {
  const events = fetchInternalEvents();
  
  return ContentService.createTextOutput(JSON.stringify(events))
    .setMimeType(ContentService.MimeType.JSON);
}

function fetchInternalEvents() {
  const searchQuery = 'from:cfi@sece.ac.in';
  // Fetch latest 20 threads matching the query
  const threads = GmailApp.search(searchQuery, 0, 20);
  const events = [];
  
  for (let i = 0; i < threads.length; i++) {
    const messages = threads[i].getMessages();
    // Only grab the first message in the thread for simplicity
    const msg = messages[0];
    
    const subject = msg.getSubject();
    const date = msg.getDate();
    const bodyPlain = msg.getPlainBody();
    
    // Clean body by replacing multiple spaces/newlines with single space
    let cleanBody = bodyPlain.replace(/\s+/g, ' ').trim();
    if (cleanBody.length > 250) {
      cleanBody = cleanBody.substring(0, 250) + '...';
    }
    
    // Format Date nicely
    const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const formattedDate = date.toLocaleDateString('en-US', dateOptions);
    
    // Create random-ish ID
    const randomId = 'internal-' + Math.random().toString(36).substring(2, 10);
    
    // Extract first URL from email body
    const urlMatch = bodyPlain.match(/https?:\/\/[^\s"'<]+/);
    const eventLink = urlMatch ? urlMatch[0] : '#';
    
    events.push({
      id: randomId,
      title: subject,
      badges: ["College Notification"],
      description: cleanBody,
      date: formattedDate,
      eligibility: "All Students",
      link: eventLink, // Extracted link or #
      image: "",
      ctaText: "View Notification",
      tag: "COLLEGE EVENT"
    });
  }
  
  return events;
}
