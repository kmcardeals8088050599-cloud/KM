$git = "C:\Program Files\Git\cmd\git.exe"
$repo = "C:\Users\Dell\OneDrive\Desktop\KM-main"

& $git -C $repo add -A

& $git -C $repo status

& $git -C $repo commit -m "feat: 7 features - WhatsApp alerts, AI desc, similar cars, daily report, comparison, insurance alerts, price drop"

Write-Output "--- COMMIT DONE ---"
& $git -C $repo push origin master 2>&1
Write-Output "--- PUSH DONE ---"
