import { jsPDF } from 'jspdf';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { FileOpener } from '@capacitor-community/file-opener';

export const generateResumePDF = async (data: any) => {
  const doc = new jsPDF({ format: 'a4', unit: 'pt' });
  const pw = 595.28;
  const m = 40;
  let y = 40;

  const checkPage = (addSpace = 0) => {
    if (y + addSpace > 800) {
      doc.addPage();
      y = 40;
    }
  };

  const addHr = () => {
    checkPage(10);
    doc.setLineWidth(1);
    doc.line(m, y, pw - m, y);
    y += 12;
  };

  const addSection = (title: string) => {
    checkPage(20);
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text(title, m, y);
    const w = doc.getTextWidth(title);
    doc.setLineWidth(0.5);
    doc.line(m, y + 2, m + w, y + 2);
    y += 16;
  };

  // Header
  const logoImg = document.querySelector('img[alt="SECE"]') as HTMLImageElement;
  let logoOffset = 0;
  let headerStartY = y;
  
  if (logoImg) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = logoImg.naturalWidth || 200;
      canvas.height = logoImg.naturalHeight || 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(logoImg, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        doc.addImage(dataUrl, 'PNG', m, y, 48, 48);
        logoOffset = 56;
      }
    } catch(e) { console.error('Logo render error', e); }
  }

  const centerSpaceStart = m + logoOffset;
  const centerSpaceWidth = pw - m - centerSpaceStart;
  const centerX = centerSpaceStart + (centerSpaceWidth / 2);

  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.text(data.name || 'Your Name', centerX, y + 20, { align: 'center' });
  
  y += 24 + 12;

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  
  let contacts = [];
  if (data.phone) contacts.push(`Contact: ${data.phone}`);
  if (data.email) contacts.push(`E-mail: ${data.email}`);
  
  // Draw links in line with contacts
  let links = [];
  if (data.linkedin) links.push({ label: 'Linkedin', url: data.linkedin });
  if (data.github) links.push({ label: 'Github', url: data.github });
  if (data.portfolio) links.push({ label: 'Portfolio', url: data.portfolio });
  
  let totalContactWidth = 0;
  contacts.forEach(c => totalContactWidth += doc.getTextWidth(c + ' | '));
  links.forEach((l, i) => {
    totalContactWidth += doc.getTextWidth(l.label);
    if (i < links.length - 1) totalContactWidth += doc.getTextWidth(' | ');
  });

  let startX = centerX - (totalContactWidth / 2);
  
  contacts.forEach(c => {
    doc.text(c + ' | ', startX, y);
    startX += doc.getTextWidth(c + ' | ');
  });
  
  links.forEach((l, i) => {
    doc.setTextColor(17, 85, 204);
    doc.textWithLink(l.label, startX, y, { url: l.url });
    doc.setTextColor(0, 0, 0);
    startX += doc.getTextWidth(l.label);
    if (i < links.length - 1) {
      doc.text(' | ', startX, y);
      startX += doc.getTextWidth(' | ');
    }
  });

  // Ensure y is pushed past the logo if it's tall
  y = Math.max(y + 10, headerStartY + 56 + 10);

  // Education
  if (data.education && data.education.length > 0) {
    addHr();
    addSection('EDUCATION');
    data.education.forEach((ed: any) => {
      checkPage(16);
      doc.setFont('times', 'bold');
      let typeLabel = ed.type === 'college' ? 'COLLEGE EDUCATION' : 'SCHOOLING';
      
      // Calculate widths to avoid overlap
      let yearW = 70;
      let scoreW = 90;
      let degreeW = 100;
      
      // Draw left side
      let leftStr = `${typeLabel} - ${ed.institution}`;
      let leftWidthAllowed = pw - (2 * m) - yearW - scoreW - degreeW;
      if (doc.getTextWidth(leftStr) > leftWidthAllowed) {
        let splitLeft = doc.splitTextToSize(leftStr, leftWidthAllowed);
        doc.text(splitLeft, m, y);
      } else {
        doc.text(leftStr, m, y);
      }
      
      doc.setFont('times', 'normal');
      doc.text(ed.year, pw - m, y, { align: 'right' });
      doc.text(`|| ${ed.score}`, pw - m - yearW, y, { align: 'right' });
      doc.text(`${ed.degree}`, pw - m - yearW - scoreW, y, { align: 'right' });
      
      // If left text wrapped, adjust Y based on length
      let splitLines = doc.splitTextToSize(leftStr, leftWidthAllowed);
      y += (splitLines.length * 12) + 4;
    });
  }

  // Internships
  const validInternships = data.internships?.filter((i: any) => i.company);
  if (validInternships && validInternships.length > 0) {
    addHr();
    addSection('INTERNSHIP EXPERIENCES');
    validInternships.forEach((intern: any) => {
      checkPage(40);
      doc.setFont('times', 'bold');
      let yearW = doc.getTextWidth(intern.year) + 20;
      let compStr = doc.splitTextToSize(intern.company, pw - 2*m - yearW);
      doc.text(compStr, m, y);
      
      doc.setFont('times', 'normal');
      doc.text(intern.year, pw - m, y, { align: 'right' });
      y += compStr.length * 12 + 2;
      
      const splitDesc = doc.splitTextToSize(intern.description, pw - 2*m);
      doc.text(splitDesc, m, y);
      y += splitDesc.length * 12 + 4;
      
      if (intern.skillsAcquired) {
        doc.setFont('times', 'bold');
        doc.text('SKILLS ACQUIRED: ', m + 16, y);
        const w = doc.getTextWidth('SKILLS ACQUIRED: ');
        doc.setFont('times', 'normal');
        const splitSkills = doc.splitTextToSize(intern.skillsAcquired, pw - 2*m - 16 - w);
        doc.text(splitSkills, m + 16 + w, y);
        y += splitSkills.length * 12 + 4;
      }
    });
  }

  // Projects
  const validProjects = data.projects?.filter((p: any) => p.name);
  if (validProjects && validProjects.length > 0) {
    addHr();
    addSection('PROJECTS');
    validProjects.forEach((proj: any) => {
      checkPage(40);
      
      doc.setFont('times', 'normal');
      let dateW = doc.getTextWidth(proj.date);
      let rightW = dateW;
      
      let linkW = 0;
      let linkLabel = proj.linkLabel || 'Github';
      if (proj.link) {
        linkW = doc.getTextWidth(linkLabel) + 16;
        rightW += linkW;
      }
      
      doc.setFont('times', 'bold');
      let nameStr = doc.splitTextToSize(proj.name, pw - 2*m - rightW - 20);
      doc.text(nameStr, m, y);
      
      doc.setFont('times', 'normal');
      if (proj.link) {
        let lx = pw - m - dateW - 16 - (linkW - 16);
        doc.setTextColor(17, 85, 204);
        doc.textWithLink(linkLabel, lx, y, { url: proj.link });
        doc.setTextColor(0, 0, 0);
      }
      doc.text(proj.date, pw - m, y, { align: 'right' });
      
      y += nameStr.length * 12 + 2;
      
      if (proj.techStack) {
        doc.setFont('times', 'bold');
        doc.text('Tech Stack: ', m, y);
        doc.setFont('times', 'normal');
        let tsW = doc.getTextWidth('Tech Stack: ');
        let splitTs = doc.splitTextToSize(proj.techStack, pw - 2*m - tsW);
        doc.text(splitTs, m + tsW, y);
        y += splitTs.length * 12 + 2;
      }
      
      const splitDesc = doc.splitTextToSize(proj.description, pw - 2*m);
      doc.text(splitDesc, m, y);
      y += splitDesc.length * 12 + 6;
    });
  }

  // Achievements
  const validAchievements = data.achievements?.filter((a: any) => a.title);
  if (validAchievements && validAchievements.length > 0) {
    addHr();
    addSection('ACHIEVEMENTS');
    validAchievements.forEach((ach: any) => {
      checkPage(16);
      doc.setFont('times', ach.bold ? 'bold' : 'normal');
      
      let yearW = doc.getTextWidth(ach.year) + 20;
      let titleStr = doc.splitTextToSize(ach.title, pw - 2*m - yearW);
      doc.text(titleStr, m, y);
      
      doc.setFont('times', 'bold');
      doc.text(ach.year, pw - m, y, { align: 'right' });
      y += titleStr.length * 12 + 2;
    });
  }

  // Coding Profiles
  const validProfiles = data.codingProfiles?.filter((c: any) => c.details);
  if (validProfiles && validProfiles.length > 0) {
    addHr();
    addSection('CODING PROFILES');
    validProfiles.forEach((cp: any) => {
      checkPage(16);
      doc.setFont('times', 'normal');
      let text = `${cp.platform} - ${cp.details}`;
      let textLines = doc.splitTextToSize(text, pw - 2*m - 80);
      doc.text(textLines, m, y);
      
      if (cp.link) {
        let lastLine = textLines[textLines.length - 1];
        let linkX = m + doc.getTextWidth(lastLine) + 5;
        doc.text('| Profile Link: ', linkX, y + (textLines.length - 1) * 12);
        let linkLabelX = linkX + doc.getTextWidth('| Profile Link: ');
        doc.setTextColor(17, 85, 204);
        doc.textWithLink('LINK', linkLabelX, y + (textLines.length - 1) * 12, { url: cp.link });
        doc.setTextColor(0, 0, 0);
      }
      y += textLines.length * 12 + 4;
    });
  }

  // Certifications
  const validCerts = data.certifications?.filter((c: any) => c.name);
  if (validCerts && validCerts.length > 0) {
    addHr();
    addSection('CERTIFICATIONS');
    validCerts.forEach((cert: any) => {
      checkPage(16);
      doc.setFont('times', 'normal');
      let nameStr = doc.splitTextToSize(cert.name, pw - 2*m - 180);
      doc.text(nameStr, m, y);
      
      doc.text(`| ${cert.provider}`, pw - m - 80, y, { align: 'right' });
      
      doc.setFont('times', 'bold');
      doc.text(cert.year, pw - m, y, { align: 'right' });
      y += nameStr.length * 12 + 4;
    });
  }

  // Skills
  if (Object.values(data.skills || {}).some(v => v)) {
    addHr();
    addSection('TECHNICAL SKILLS');
    const skills = data.skills;
    const addSkill = (label: string, val: string) => {
      if (!val) return;
      checkPage(16);
      doc.setFont('times', 'bold');
      doc.text(label, m, y);
      doc.setFont('times', 'normal');
      
      let splitVal = doc.splitTextToSize(val, pw - m - (m + 140));
      doc.text(splitVal, m + 140, y);
      y += splitVal.length * 12 + 4;
    };
    addSkill('Languages', skills.languages);
    addSkill('Technologies', skills.frameworks);
    addSkill('Database', skills.database);
    addSkill('Tools', skills.tools);
    addSkill('Core Concepts', skills.concepts);
  }

  const fileName = `Resume_${data.name ? data.name.replace(/\s+/g, '_') : 'Draft'}.pdf`;

  if (Capacitor.isNativePlatform()) {
    const base64 = doc.output('datauristring').split(',')[1];
    try {
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Documents,
        recursive: true
      });
      
      await LocalNotifications.requestPermissions();
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Resume Downloaded!',
            body: `Tap to open ${fileName}`,
            id: new Date().getTime() % 100000,
            extra: { path: savedFile.uri }
          }
        ]
      });

      // Also try to open immediately
      FileOpener.open({ filePath: savedFile.uri, contentType: 'application/pdf' }).catch(console.error);

    } catch (e) {
      console.error('File saving failed', e);
      alert('Failed to save PDF on device.');
    }
  } else {
    // Web fallback
    doc.save(fileName);
  }
};
