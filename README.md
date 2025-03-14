# 📌 MySQL Configuration & XAMPP Auto-Startup Guide

This guide provides a step-by-step approach to configuring MySQL in XAMPP, setting up a MySQL user, establishing a database connection, and automating the startup of XAMPP services and a Next.js application on Windows.

---

## 🛠️ Configuring MySQL in XAMPP

### 🔹 Step 1: Locate the MySQL Configuration File
To modify MySQL settings, locate the configuration file:

- **Windows:** `C:\xampp\mysql\bin\my.ini`

### 🔹 Step 2: Modify the Bind Address
To allow remote access:

1. Open `my.ini`.
2. Locate:
   
   ```ini
   bind-address = 127.0.0.1
   ```
   
   Change it to:
   
   ```ini
   bind-address = 0.0.0.0
   ```
3. Save and restart MySQL.

### 🔹 Step 3: Restart MySQL Service

1. Open XAMPP Control Panel.
2. Click **Stop** next to MySQL, then **Start**.

### 🔹 Step 4: Connecting to MySQL Remotely
Use the server’s IPv4 address instead of `localhost`:

- Run `ipconfig` in Command Prompt to find your IP address.

---

## 🏗️ Creating a MySQL User with Full Privileges
Execute the following SQL commands:

```sql
CREATE USER 'root'@'%' IDENTIFIED BY 'root';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

### 🔹 Explanation:
- `'root'@'%'` → Allows connections from any host.
- `IDENTIFIED BY 'root'` → Sets the password.
- `GRANT ALL PRIVILEGES` → Grants full access.
- `WITH GRANT OPTION` → Allows granting permissions to others.
- `FLUSH PRIVILEGES;` → Applies changes.

---

## 🔗 Database Connection Configuration
Set up the connection string in `.env`:

```env
NEXT_PUBLIC_DATABASE_CONNECTION=mysql://root:root@192.168.68.48:3306/test
```

### 🔹 Breakdown:
- `root:root` → MySQL username/password.
- `192.168.68.48` → Server’s IP address.
- `3306` → MySQL port.
- `test` → Database name.

### ⚠️ Security Best Practices
- ❌ Avoid using `root` in production.
- 🔒 Restrict remote access to specific IPs instead of `%`.
- 🔑 Use strong passwords for better security.

---

## 📌 XAMPP Server Auto-Startup Script

### 📂 1. Create a VBScript File
Open Notepad and add the following script:

```vbscript
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "C:\\xampp\\apache\\bin\\httpd.exe", 0, False
WshShell.Run "C:\\xampp\\mysql\\bin\\mysqld.exe", 0, False
```

Save as `start_xampp.vbs`.

### 🚀 2. Add to Windows Startup
1. Press `Win + R`, type `shell:startup`, and hit `Enter`.
2. Copy `start_xampp.vbs` into the **Startup** folder.

✅ XAMPP servers will now start automatically on system boot.

---

## 📌 Running a Next.js App at Startup

### 📂 1. Create a VBScript File
Open Notepad and add the following:

```vbscript
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd C:\\Users\\YourName\\Projects\\my-nextjs-app && npm run start", 0, False
```

Replace `C:\\Users\\YourName\\Projects\\my-nextjs-app` with your actual Next.js project path.

Save as `start-nextjs-hidden.vbs`.

### 🚀 2. Add to Windows Startup
1. Press `Win + R`, type `shell:startup`, and hit `Enter`.
2. Copy `start-nextjs-hidden.vbs` into the **Startup** folder.

✅ Your Next.js app will now start automatically at system boot.

---

## 📌 Final Notes
- ⚙️ Ensure **Node.js** and **npm** are installed.
- 🛠️ Use **Windows Task Scheduler** for admin privileges if required.
- 🔍 Verify that your **environment variables** load correctly at startup.

💡 With this setup, your **XAMPP servers and Next.js app** will start automatically without any visible command windows! 🚀