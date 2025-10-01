import requests

# Login
r = requests.post('http://localhost:8000/api/auth/login', json={'email':'admin@example.com','password':'admin123'})
token = r.json()['access_token']
print('✅ Logged in')

# Change password
r2 = requests.post('http://localhost:8000/api/auth/change-password', 
                   params={'current_password':'admin123','new_password':'admin123new'}, 
                   headers={'Authorization':f'Bearer {token}'})
print(f'Password change: {r2.status_code} - {r2.json()}')

# Login with new password
r3 = requests.post('http://localhost:8000/api/auth/login', json={'email':'admin@example.com','password':'admin123new'})
print(f'✅ Login with new password: {r3.status_code}')

# Change back
if r3.status_code == 200:
    token2 = r3.json()['access_token']
    r4 = requests.post('http://localhost:8000/api/auth/change-password', 
                       params={'current_password':'admin123new','new_password':'admin123'}, 
                       headers={'Authorization':f'Bearer {token2}'})
    print(f'✅ Changed back to original: {r4.status_code}')

