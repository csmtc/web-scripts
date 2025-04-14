$file = "./dist/cool18.user.js"
scp -i $($Env:USERPROFILE + "/.ssh/id_rsa") $file atcra@atcra.top:C:/SoftwareGreen/nginx/html/dist/web-script