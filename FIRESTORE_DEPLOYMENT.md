# Firestore Rules Deployment Instructions

## Option 1: Deploy via Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize/Connect project**:
   ```bash
   firebase use mgsolar-934cc
   ```

4. **Deploy Firestore rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Option 2: Manual Deployment via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `mgsolar-934cc`
3. Click **"Firestore Database"** → **"Rules"** tab
4. Copy the entire content from `firestore.rules` file
5. Paste it into the rules editor
6. Click **"Publish"**

## Create Admin User

### Step 1: Create Firebase Auth User
1. In Firebase Console, go to **"Authentication"** → **"Users"**
2. Click **"Add user"**
3. Enter:
   - **Email**: `vipingaur89@gmail.com`
   - **Password**: Choose a secure password (min 6 characters)
4. Click **"Add user"**

### Step 2: Add Admin Data to Firestore
1. Go to **"Firestore Database"** → **"Data"** tab
2. Click **"Add collection"**
3. **Collection ID**: `adminUsers`
4. Click **"Next"**
5. **Document ID**: `vipingaur89@gmail.com`
6. Add these fields:
   ```
   name: "Vipin Gaur"
   email: "vipingaur89@gmail.com"
   role: "super_admin"
   permissions: ["all"]
   active: true
   createdAt: [Current timestamp]
   ```
7. Click **"Save"**

## Test Admin Login

1. Go to your app's `/admin-login` page
2. Login with:
   - Email: `vipingaur89@gmail.com`
   - Password: The password you set in Firebase Auth
3. Should redirect to `/mgadmin` dashboard

## Troubleshooting

- **Still getting permission errors?**
  - Make sure Firestore rules are deployed
  - Verify the admin user exists in both Authentication AND Firestore
  - Check that `active: true` in Firestore document

- **"User not authorized" error?**
  - Check that email matches exactly in both Firebase Auth and Firestore
  - Verify the Firestore document is in `adminUsers` collection

- **Login succeeds but can't access dashboard?**
  - Check session storage for admin data
  - Verify `/mgadmin` route protection</content>
<parameter name="filePath">FIRESTORE_DEPLOYMENT.md