// All responses are mock fixtures, not observed live API results.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createAuthenticaClient, AuthenticaError} from '../templates/authentica-client.mjs';
const PHONE = '+12025550123'; // Fixture only: never transmitted.
const KEY = 'test-only-not-a-real-key';
function fixture(body, status = 200) {
  const calls = [];
  const client = createAuthenticaClient({apiKey: KEY, fetchImpl: async (url, options) => {
    calls.push({url, options});
    return {ok: status >= 200 && status < 300, status, json: async () => body};
  }});
  return {client, calls};
}
const face = {user_id:'u1', registered_face_image:'YQ==', query_face_image:'Yg=='};
const voice = {user_id:'u1', registered_audio:'YQ==', query_audio:'Yg=='};

test('balance uses fixed HTTPS URL, raw key, GET and no body', async () => {
  const {client, calls} = fixture({success:true, data:{balance:1.5}});
  assert.equal(await client.balance(), 1.5);
  const {url, options} = calls[0];
  assert.equal(url, 'https://api.authentica.sa/api/v2/balance');
  assert.equal(options.method, 'GET');
  assert.equal(options.headers['X-Authorization'], KEY);
  assert.equal(options.headers.Accept, 'application/json');
  assert.equal(options.headers.Authorization, undefined);
  assert.equal(options.body, undefined);
  assert.equal(options.redirect, 'error');
  assert.ok(options.signal instanceof AbortSignal);
});
for (const method of ['sms','whatsapp','email']) {
  test(`send ${method} builds the exact payload`, async () => {
    const {client, calls} = fixture({success:true, data:null});
    const input = {method, template_id:1, ...(method === 'email' ? {email:'test@example.com'} : {phone:PHONE})};
    assert.equal(await client.sendOtp(input), true);
    assert.equal(calls[0].url, 'https://api.authentica.sa/api/v2/send-otp');
    assert.equal(calls[0].options.method, 'POST');
    assert.equal(calls[0].options.headers['Content-Type'], 'application/json');
    assert.deepEqual(JSON.parse(calls[0].options.body), input);
  });
}
test('OTP verify preserves leading zeros and uses status, not success', async () => {
  const {client, calls} = fixture({status:true});
  assert.equal(await client.verifyOtp({phone:PHONE, otp:'001234'}), true);
  assert.deepEqual(JSON.parse(calls[0].options.body), {phone:PHONE, otp:'001234'});
  assert.equal(calls[0].url, 'https://api.authentica.sa/api/v2/verify-otp');
  await assert.rejects(fixture({success:true}).client.verifyOtp({phone:PHONE, otp:'001234'}), {kind:'invalid_response'});
});
test('email verification sends only email and code', async () => {
  const {client,calls} = fixture({status:true});
  await client.verifyOtp({email:'test@example.com',otp:'000001'});
  assert.deepEqual(JSON.parse(calls[0].options.body), {email:'test@example.com',otp:'000001'});
});
test('explicit negative verdicts do not authenticate', async () => {
  assert.equal(await fixture({status:false}).client.verifyOtp({phone:PHONE,otp:'001234'}), false);
  assert.equal(await fixture({success:false}).client.sendOtp({method:'sms',phone:PHONE,template_id:1}), false);
});
for (const [name, input, path] of [['verifyFace',face,'face'],['verifyVoice',voice,'voice']]) {
  test(`${name} match, mismatch and user binding`, async () => {
    const {client,calls} = fixture({success:true,data:{user_id:'u1',result:true}});
    assert.equal(await client[name](input), true);
    assert.equal(calls[0].url, `https://api.authentica.sa/api/v2/verify-by-${path}`);
    assert.deepEqual(JSON.parse(calls[0].options.body),input);
    assert.equal(await fixture({success:true,data:{user_id:'u1',result:false}}).client[name](input), false);
    await assert.rejects(fixture({success:true,data:{user_id:'u2',result:true}}).client[name](input), {kind:'invalid_response'});
    await assert.rejects(fixture({success:true,data:{user_id:'u1',result:'true'}}).client[name](input), {kind:'invalid_response'});
  });
}
test('invalid inputs fail before transport', async () => {
  const {client,calls} = fixture({status:true});
  for (const input of [
    {phone:PHONE, email:'test@example.com',otp:'123'},
    {otp:'123'}, {phone:'0551234567',otp:'123'},
    {phone:PHONE,otp:123}, {phone:PHONE,otp:''}
  ]) await assert.rejects(client.verifyOtp(input), {kind:'invalid_input'});
  for (const input of [
    {method:'email',phone:PHONE,template_id:1},
    {method:'sms',phone:PHONE},
    {method:'fax',phone:PHONE,template_id:1},
    {method:'sms',phone:PHONE,template_id:1,otp:'123'},
    {method:'sms',phone:PHONE,template_id:1,fallback_email:'test@example.com'}
  ]) await assert.rejects(client.sendOtp(input), {kind:'invalid_input'});
  await assert.rejects(client.verifyFace({...face,query_face_image:'data:image/png;base64,Yg=='}), {kind:'invalid_input'});
  assert.equal(calls.length,0);
});
test('malformed and truthy nonboolean responses fail closed', async () => {
  for (const body of [null, [], {}, {status:'true'}, {status:1}])
    await assert.rejects(fixture(body).client.verifyOtp({phone:PHONE,otp:'123'}), {kind:'invalid_response'});
  for (const balance of ['12',true,null,Infinity])
    await assert.rejects(fixture({success:true,data:{balance}}).client.balance(), {kind:'invalid_response'});
  await assert.rejects(fixture({success:'true'}).client.sendOtp({method:'sms',phone:PHONE,template_id:1}), {kind:'invalid_response'});
});
for (const status of [301,400,401,422,429,500,503]) {
  test(`HTTP ${status} fails without retries or response leakage`, async () => {
    const {client,calls} = fixture({status:true, secret:KEY},status);
    await assert.rejects(client.verifyOtp({phone:PHONE,otp:'001234'}), e => {
      assert.equal(e.kind,'http_error'); assert.equal(e.status,status);
      assert.equal(e.message.includes(KEY),false); return true;
    });
    assert.equal(calls.length,1);
  });
}
test('transport exception sanitized and not retried', async () => {
  let count=0;
  const client=createAuthenticaClient({apiKey:KEY,fetchImpl:async()=>{count++;throw Error(KEY);}});
  await assert.rejects(client.verifyOtp({phone:PHONE,otp:'001234'}),e=>{
    assert.ok(e instanceof AuthenticaError); assert.equal(e.kind,'transport_unknown');
    assert.equal(e.message.includes(KEY),false); assert.equal(e.cause,undefined); return true;
  });
  assert.equal(count,1);
});
test('invalid JSON fails closed', async () => {
  const client=createAuthenticaClient({apiKey:KEY,fetchImpl:async()=>({ok:true,json:async()=>{throw Error(KEY);}})});
  await assert.rejects(client.balance(),{kind:'invalid_response'});
});
test('timeout aborts transport without retry', async () => {
  let count=0;
  // Keep event loop alive: AbortSignal.timeout timers are unref'ed in Node.
  const keepAlive=setTimeout(()=>{},1000);
  try {
    const client=createAuthenticaClient({apiKey:KEY,timeoutMs:10,fetchImpl:async(_,options)=>{
      count++;
      return new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Error('timeout')),{once:true}));
    }});
    await assert.rejects(client.balance(),{kind:'transport_unknown'});
    assert.equal(count,1);
  } finally { clearTimeout(keepAlive); }
});
test('configuration validation rejects empty or multiline keys', () => {
  for (const apiKey of ['', ' key ', 'x\ny']) assert.throws(()=>createAuthenticaClient({apiKey}),{kind:'invalid_input'});
});
