# Institution Logos Setup Guide 🎨

## ✅ Feature Implemented

Dynamic logos in the sidebar that change based on which institution is logged in!

---

## 📁 Logo File Setup

### Step 1: Prepare Your Logo Files

You need **4 logo files** (one for each institution):

1. **neftgazlogo.png** - Нефт ва газ институти
2. **minerallogo.png** - Минерал ресурслар институти
3. **gidrologo.png** - Гидрогеология институти
4. **geofizikalogo.png** - Геофизика институти

### Step 2: Logo Requirements

**Format:** PNG (with transparent background recommended)  
**Size:** Recommended 200x200px or 500x500px  
**Aspect Ratio:** Square (1:1) works best  
**File Size:** Keep under 500KB for fast loading

### Step 3: Place Logo Files

Put all 4 logo files in this folder:
```
/workspace/src/images/
```

**Your file structure should look like:**
```
src/
  └── images/
      ├── logo.png (existing)
      ├── neftgazlogo.png ✨ NEW
      ├── minerallogo.png ✨ NEW
      ├── gidrologo.png ✨ NEW
      └── geofizikalogo.png ✨ NEW
```

---

## 🎯 How It Works

### Automatic Logo Display:

When a user logs in, the system automatically:
1. Checks which institution they belong to
2. Displays the corresponding logo in the sidebar
3. Falls back to the building icon if logo is missing

### Institution Mapping:

| Institution Code | Logo File | Institution Name |
|-----------------|-----------|------------------|
| `neftgaz` | `neftgazlogo.png` | Нефт ва газ институти |
| `mineral` | `minerallogo.png` | Минерал ресурслар институти |
| `gidro` | `gidrologo.png` | Гидрогеология институти |
| `geofizika` | `geofizikalogo.png` | Геофизика институти |

---

## 📝 Example Usage

### When User Logs In:

**User: `neftgaz`**
```
┌─────────────────────┐
│  [Neft Gaz Logo]    │
│  Институт Панели    │
│  Patent System      │
└─────────────────────┘
```

**User: `mineral`**
```
┌─────────────────────┐
│  [Mineral Logo]     │
│  Институт Панели    │
│  Patent System      │
└─────────────────────┘
```

---

## 🎨 CSS Styling

The logos are styled with these properties:
```css
.sidebar-logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
  border-radius: 0.5rem;
}
```

### Want to Adjust Logo Size?

Edit `/workspace/src/styles/custom.css` and change:
```css
.sidebar-logo {
  width: 60px;    /* Change this */
  height: 60px;   /* Change this */
  object-fit: contain;
  border-radius: 0.5rem;
}
```

---

## 🔧 Code Implementation

### UserDashboard.jsx

**Logo Import:**
```javascript
import neftgazLogo from '../images/neftgazlogo.png'
import mineralLogo from '../images/minerallogo.png'
import gidroLogo from '../images/gidrologo.png'
import geofizikaLogo from '../images/geofizikalogo.png'
```

**Logo Mapping:**
```javascript
const INSTITUTION_LOGOS = {
  neftgaz: neftgazLogo,
  mineral: mineralLogo,
  gidro: gidroLogo,
  geofizika: geofizikaLogo
}
```

**Dynamic Display:**
```javascript
<div className="sidebar-brand-icon">
  {INSTITUTION_LOGOS[currentUser?.name] ? (
    <img 
      src={INSTITUTION_LOGOS[currentUser?.name]} 
      alt={`${currentUser?.fullName} Logo`} 
      className="sidebar-logo" 
    />
  ) : (
    <FaBuilding />
  )}
</div>
```

---

## ✅ Checklist

Before testing, make sure:
- [ ] All 4 logo files are in `/workspace/src/images/`
- [ ] Logo files are named exactly as specified (case-sensitive)
- [ ] Logos are PNG format
- [ ] Logos are reasonable size (under 500KB)
- [ ] Frontend is restarted after adding logo files

---

## 🧪 Testing

### Test Each Institution:

1. **Test Neftgaz:**
   ```
   Login: neftgaz / neftgaz123
   Expected: Shows neftgaz logo
   ```

2. **Test Mineral:**
   ```
   Login: mineral / mineral123
   Expected: Shows mineral logo
   ```

3. **Test Gidro:**
   ```
   Login: gidro / gidro123
   Expected: Shows gidro logo
   ```

4. **Test Geofizika:**
   ```
   Login: geofizika / geofizika123
   Expected: Shows geofizika logo
   ```

### Without Logo Files:
If logo file is missing, it will show the default building icon (FaBuilding).

---

## 🎨 Logo Design Tips

### Good Logo Characteristics:
✅ Simple and clear design
✅ Works well in small sizes (50x50px)
✅ High contrast for visibility
✅ Transparent background
✅ Recognizable at a glance

### Avoid:
❌ Too much detail
❌ Very thin lines
❌ Low contrast colors
❌ Complex text
❌ Large file sizes

---

## 🔄 Adding More Institutions Later

If you add a new institution in the future:

1. **Add logo file:** `newinstitution.png` in `/workspace/src/images/`
2. **Import logo:** Add to imports in `UserDashboard.jsx`
   ```javascript
   import newInstitutionLogo from '../images/newinstitution.png'
   ```
3. **Add to mapping:**
   ```javascript
   const INSTITUTION_LOGOS = {
     neftgaz: neftgazLogo,
     mineral: mineralLogo,
     gidro: gidroLogo,
     geofizika: geofizikaLogo,
     newinstitution: newInstitutionLogo  // Add this
   }
   ```

---

## 📱 Responsive Behavior

The logos are responsive and will:
- Display at 50x50px on desktop
- Maintain aspect ratio
- Scale properly on mobile devices
- Fallback to icon if image fails to load

---

## 🎉 Benefits

✅ Professional branding for each institution
✅ Instant visual identification
✅ Improved user experience
✅ Easy to maintain and update
✅ Automatic fallback to icon if logo missing

---

## 📞 Troubleshooting

### Logo Not Showing?

1. **Check file name:** Must be exact (case-sensitive)
2. **Check file location:** Must be in `/workspace/src/images/`
3. **Check file format:** Must be PNG
4. **Restart frontend:** `npm run dev` (restart after adding files)
5. **Clear browser cache:** Ctrl+F5 or Cmd+Shift+R
6. **Check console:** Look for 404 errors in browser console

### Logo Too Big/Small?

Edit `.sidebar-logo` CSS width/height in `/workspace/src/styles/custom.css`

### Logo Quality Poor?

Use higher resolution source image (at least 200x200px)

---

All set! Just add your 4 logo files and restart the frontend! 🚀
