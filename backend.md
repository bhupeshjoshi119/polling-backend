Polling Backend: http://localhost:9000
Auth Service (deployed): https://auth-service-pearl-tau.vercel.app/

🔐 AUTH SERVICE APIs
1. Signup

curl -X POST https://auth-service-pearl-tau.vercel.app/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Bhupesh","lastName":"Joshi","email":"bhupesh@test.com","password":"Test@1234"}'

{"message":"user has been created successfully","data":{"id":"62711d2c-79aa-471b-85cc-d5d3e638b29d"}}%   

  2. Signin — token save karo
curl -X POST https://auth-service-pearl-tau.vercel.app/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"bhupesh@test.com","password":"Test@1234"}'

Response se data.token copy karo, neeche TOKEN=... mein set karo.

3. Me (profile check)

curl https://auth-service-pearl-tau.vercel.app/auth/me \
  -H "Authorization: Bearer TOKEN_YAHAN_PASTE_KARO"

4. Forgot Password (OTP bhejo)

curl -X POST https://auth-service-pearl-tau.vercel.app/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"bhupesh@test.com"}'

<!-- 5. Dev — Latest OTP dekho (local/dev only)
curl 'https://auth-service-pearl-tau.vercel.app/auth/dev/latest-otp?email=bhupesh@test.com' -->


<!-- 6. Reset Password
curl -X POST https://auth-service-pearl-tau.vercel.app/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"otp":"123456","newPassword":"NewPass@5678"}' ye hum frontend se karege temp-->

7. Logout
curl https://auth-service-pearl-tau.vercel.app/auth/logout \
  -H "Authorization: Bearer $TOKEN"

{"message":"Logout successful"}% 

📊 POLLING BACKEND APIs
Pehle TOKEN variable set karo terminal mein:
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyNzExZDJjLTc5YWEtNDcxYi04NWNjLWQ1ZDNlNjM4YjI5ZCIsImlhdCI6MTc3ODY3Nzc2M30.I9XSBJbcTzSmu_k2vXV0gTwLe2UGKIu_dp2Ac56cGwE"

8. Health Check
curl http://localhost:9000/
{"message":"Polling App API is running"}%  

POLLS
9. Poll Create karo (authenticated)
curl -X POST http://localhost:9000/api/polls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Favourite JS Framework",
    "description": "Vote for your favourite",
    "isAnonymous": false,
    "expiresAt": "2026-12-31T23:59:00.000Z",
    "questions": [
      {
        "text": "Which framework do you prefer?",
        "isMandatory": true,
        "options": [
          {"text": "React"},
          {"text": "Vue"},
          {"text": "Angular"},
          {"text": "Svelte"}
        ]
      },
      {
        "text": "How long have you been coding?",
        "isMandatory": false,
        "options": [
          {"text": "Less than 1 year"},
          {"text": "1-3 years"},
          {"text": "3+ years"}
        ]
      }
    ]
  }'

  {"message":"Poll created","data":{"title":"Favourite JS Framework","description":"Vote for your favourite","creatorId":"62711d2c-79aa-471b-85cc-d5d3e638b29d","questions":[{"text":"Which framework do you prefer?","options":[{"text":"React","_id":"6a047877c963d41ac619589d"},{"text":"Vue","_id":"6a047877c963d41ac619589e"},{"text":"Angular","_id":"6a047877c963d41ac619589f"},{"text":"Svelte","_id":"6a047877c963d41ac61958a0"}],"isMandatory":true,"_id":"6a047877c963d41ac619589c"},{"text":"How long have you been coding?","options":[{"text":"Less than 1 year","_id":"6a047877c963d41ac61958a2"},{"text":"1-3 years","_id":"6a047877c963d41ac61958a3"},{"text":"3+ years","_id":"6a047877c963d41ac61958a4"}],"isMandatory":false,"_id":"6a047877c963d41ac61958a1"}],"isAnonymous":false,"expiresAt":"2026-12-31T23:59:00.000Z","isPublished":false,"isActive":true,"totalResponses":0,"_id":"6a047877c963d41ac619589b","createdAt":"2026-05-13T13:11:19.305Z","updatedAt":"2026-05-13T13:11:19.305Z","__v":0}}% 

  Response se data._id copy karo — yahi POLL_ID hai.

  10. Mere saare polls dekho
  curl http://localhost:9000/api/polls \
  -H "Authorization: Bearer $TOKEN"

{"data":[{"_id":"6a047877c963d41ac619589b","title":"Favourite JS Framework","description":"Vote for your favourite","creatorId":"62711d2c-79aa-471b-85cc-d5d3e638b29d","questions":[{"text":"Which framework do you prefer?","options":[{"text":"React","_id":"6a047877c963d41ac619589d"},{"text":"Vue","_id":"6a047877c963d41ac619589e"},{"text":"Angular","_id":"6a047877c963d41ac619589f"},{"text":"Svelte","_id":"6a047877c963d41ac61958a0"}],"isMandatory":true,"_id":"6a047877c963d41ac619589c"},{"text":"How long have you been coding?","options":[{"text":"Less than 1 year","_id":"6a047877c963d41ac61958a2"},{"text":"1-3 years","_id":"6a047877c963d41ac61958a3"},{"text":"3+ years","_id":"6a047877c963d41ac61958a4"}],"isMandatory":false,"_id":"6a047877c963d41ac61958a1"}],"isAnonymous":false,"expiresAt":"2026-12-31T23:59:00.000Z","isPublished":false,"isActive":true,"totalResponses":0,"createdAt":"2026-05-13T13:11:19.305Z","updatedAt":"2026-05-13T13:11:19.305Z","__v":0,"isExpired":false}]}

11. Single poll dekho (public — respondent view)
curl http://localhost:9000/api/polls/POLL_ID_YAHAN


 curl http://localhost:9000/api/polls/6a047877c963d41ac619589b

{"data":{"_id":"6a047877c963d41ac619589b","title":"Favourite JS Framework","description":"Vote for your favourite","questions":[{"text":"Which framework do you prefer?","options":[{"text":"React","_id":"6a047877c963d41ac619589d"},{"text":"Vue","_id":"6a047877c963d41ac619589e"},{"text":"Angular","_id":"6a047877c963d41ac619589f"},{"text":"Svelte","_id":"6a047877c963d41ac61958a0"}],"isMandatory":true,"_id":"6a047877c963d41ac619589c"},{"text":"How long have you been coding?","options":[{"text":"Less than 1 year","_id":"6a047877c963d41ac61958a2"},{"text":"1-3 years","_id":"6a047877c963d41ac61958a3"},{"text":"3+ years","_id":"6a047877c963d41ac61958a4"}],"isMandatory":false,"_id":"6a047877c963d41ac61958a1"}],"isAnonymous":false,"expiresAt":"2026-12-31T23:59:00.000Z","isExpired":false,"viewMode":"respond"}}% 


RESPONSES
12. Response submit karo (authenticated poll)

Pehle poll GET karo, questions[].\_id aur options[].\_id copy karo, phir:

curl -X POST http://localhost:9000/api/polls/POLL_ID_YAHAN/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "answers": [
      {
        "questionId": "QUESTION_ID_YAHAN",
        "optionId": "OPTION_ID_YAHAN"
      }
    ]
  }'

  13. Response submit karo (anonymous poll)


curl -X POST http://localhost:9000/api/polls/POLL_ID_YAHAN/responses \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "questionId": "QUESTION_ID_YAHAN",
        "optionId": "OPTION_ID_YAHAN"
      }
    ]
  }'

ANALYTICS
14. Analytics dekho (creator only)
curl http://localhost:9000/api/polls/POLL_ID_YAHAN/responses/analytics \
  -H "Authorization: Bearer $TOKEN"

15. Results publish karo

curl -X PATCH http://localhost:9000/api/polls/POLL_ID_YAHAN/publish \
  -H "Authorization: Bearer $TOKEN"

16. Published poll analytics (public — bina token ke)

curl http://localhost:9000/api/polls/POLL_ID_YAHAN/responses/analytics

CLEANUP
17. Poll delete karo
curl -X DELETE http://localhost:9000/api/polls/POLL_ID_YAHAN \
  -H "Authorization: Bearer $TOKEN"

⚡ Quick Test Flow (copy-paste sequence)
# Step 1 — Signin aur token save karo
TOKEN=$(curl -s -X POST https://auth-service-6zuikuaof-bhupesh-joshis-projects.vercel.app/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"bhupesh@test.com","password":"Test@1234"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")

echo "Token: $TOKEN"

# Step 2 — Poll banao
POLL_ID=$(curl -s -X POST http://localhost:9000/api/polls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test Poll","isAnonymous":true,"expiresAt":"2026-12-31T23:59:00.000Z","questions":[{"text":"Best language?","isMandatory":true,"options":[{"text":"JavaScript"},{"text":"Python"}]}]}' | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['_id'])")

echo "Poll ID: $POLL_ID"

# Step 3 — Poll dekho (questionId aur optionId copy karo)
curl -s http://localhost:9000/api/polls/$POLL_ID | python3 -m json.tool

# Step 4 — Analytics
curl -s http://localhost:9000/api/polls/$POLL_ID/responses/analytics \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

  ❌ Error Cases Test karo
Expired poll pe response dena:

# expiresAt past mein set karo poll create karte waqt, phir response try karo
# Expected: 410 Gone — "This poll has expired"
curl -X POST http://localhost:9000/api/polls/POLL_ID/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"answers":[]}'
# Expected: 400 — "At least one answer required"


Duplicate response (authenticated poll):
# Same poll pe same user se 2 baar response bhejo
# Expected: 409 Conflict — "You have already responded"


Bina login ke authenticated poll pe respond karna:

curl -X POST http://localhost:9000/api/polls/POLL_ID/responses \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"questionId":"...","optionId":"..."}]}'
# Expected: 401 — "This poll requires authentication"
