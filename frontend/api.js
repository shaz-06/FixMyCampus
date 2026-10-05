/* Shared API client. The only persisted browser state is the JWT and safe user profile. */
const API_BASE_URL = 'http://localhost:5001/api';
const FixMyCampusAPI = (() => {
  const token = () => localStorage.getItem('fmc_token');
  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { 'Content-Type':'application/json', ...(token() ? { Authorization:`Bearer ${token()}` } : {}), ...(options.headers || {}) } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { if (response.status === 401) logout(false); throw new Error(body.message || 'Request failed.'); }
    return body.data;
  }
  function saveSession(data) { localStorage.setItem('fmc_token', data.token); localStorage.setItem('fmc_current_user', JSON.stringify(data.user)); localStorage.setItem('fmc_logged_in','true'); }
  function logout(redirect = true) { ['fmc_token','fmc_current_user','fmc_logged_in'].forEach(k => localStorage.removeItem(k)); if (redirect) location.href='index.html'; }
  return { request, saveSession, logout,
    registerUser: data => request('/auth/register',{method:'POST',body:JSON.stringify(data)}), loginUser: data => request('/auth/login',{method:'POST',body:JSON.stringify(data)}), getCurrentUser: () => request('/auth/me'),
    createIssue: data => request('/issues',{method:'POST',body:JSON.stringify(data)}), getIssues: () => request('/issues'), getIssue: id => request(`/issues/${id}`), updateIssue: (id,data) => request(`/issues/${id}`,{method:'PUT',body:JSON.stringify(data)}), deleteIssue:id=>request(`/issues/${id}`,{method:'DELETE'}),
    getAnnouncements:()=>request('/announcements'), submitFeedback:data=>request('/feedback',{method:'POST',body:JSON.stringify(data)}), getAdminDashboard:()=>request('/admin/dashboard'), getAdminIssues:()=>request('/admin/issues'), updateIssueStatus:(id,data)=>request(`/admin/issues/${id}/status`,{method:'PUT',body:JSON.stringify(data)}), getUsers:()=>request('/users'), getFeedback:()=>request('/feedback')
  };
})();

function fmcDisplay(id, message) { const el=document.getElementById(id); if(el){ el.textContent=message; el.style.display='block'; } }
// Capturing handlers replace the legacy localStorage auth handlers without changing their UI.
document.addEventListener('submit', async event => {
  const form=event.target;
  if (!['loginForm','registerForm'].includes(form.id)) return;
  event.preventDefault(); event.stopImmediatePropagation();
  const isRegister=form.id==='registerForm', errorId=isRegister?'registerError':'loginError', successId=isRegister?'registerSuccess':'loginSuccess';
  const error=document.getElementById(errorId), success=document.getElementById(successId); if(error) error.style.display='none'; if(success) success.style.display='none';
  try {
    if (isRegister) { const name=document.getElementById('registerName').value.trim(), email=document.getElementById('registerEmail').value.trim(), password=document.getElementById('registerPassword').value, confirm=document.getElementById('confirmPassword').value; if(!name||!email||password.length<6||password!==confirm) throw new Error(password!==confirm?'Passwords do not match.':'Please provide a name, valid email, and password of at least 6 characters.'); await FixMyCampusAPI.registerUser({name,email,password}); fmcDisplay(successId,'Account created successfully. Please sign in.'); form.reset(); setTimeout(()=>document.getElementById('showLogin')?.click(),700); }
    else { const data=await FixMyCampusAPI.loginUser({email:document.getElementById('loginEmail').value.trim(),password:document.getElementById('loginPassword').value}); FixMyCampusAPI.saveSession(data); fmcDisplay(successId,`Login successful! Welcome, ${data.user.name}.`); setTimeout(()=>location.href=data.user.role==='admin'?'admin.html':'landing.html',600); }
  } catch(e) { fmcDisplay(errorId,e.message); }
}, true);

function fmcIssue(issue) { return { ...issue, id:issue._id, studentId:issue.reportedBy?._id, studentName:issue.reportedBy?.name || '', department:issue.assignedTo?.department || 'General Administration', history:[{status:issue.status,time:issue.updatedAt,note:'Latest status from FixMyCampus.'}], photoUrl:'https://placehold.co/600x400/e2e8f0/475569?text=Campus+Issue' }; }
document.addEventListener('DOMContentLoaded', async () => {
  const user=JSON.parse(localStorage.getItem('fmc_current_user')||'null');
  if (!user || !localStorage.getItem('fmc_token')) return;
  if (location.pathname.endsWith('landing.html')) {
    try { const me=await FixMyCampusAPI.getCurrentUser(); state.currentUser={...me,id:me._id,role:me.role}; state.issues=(await FixMyCampusAPI.getIssues()).map(fmcIssue); window.handleIssueSubmit=async e=>{ e.preventDefault(); try { const issue=await FixMyCampusAPI.createIssue({category:document.getElementById('issue-category').value,title:document.getElementById('issue-title').value,location:document.getElementById('issue-location').value,description:document.getElementById('issue-desc').value,priority:document.querySelector('input[name="priority"]:checked')?.value||'Medium'}); state.issues.unshift(fmcIssue(issue)); showToast('Issue submitted successfully.','success'); switchView('dashboard'); } catch(err) { showToast(err.message,'error'); } }; render(); } catch(e) { FixMyCampusAPI.logout(); }
  }
  if (location.pathname.endsWith('admin.html') && user.role==='admin') {
    try { const [stats,items,users]=await Promise.all([FixMyCampusAPI.getAdminDashboard(),FixMyCampusAPI.getAdminIssues(),FixMyCampusAPI.getUsers()]); issues=items.map(fmcIssue); localStorage.setItem('fmc_users',JSON.stringify(users)); const values=[stats.totalIssues,stats.pendingIssues,stats.inProgressIssues,stats.resolvedIssues,stats.rejectedIssues,0]; document.querySelectorAll('.stats .card h2').forEach((el,i)=>el.textContent=values[i]||0); refreshAdmin(); window.setStatus=async(id,status)=>{try{await FixMyCampusAPI.updateIssueStatus(id,{status}); issues=(await FixMyCampusAPI.getAdminIssues()).map(fmcIssue); refreshAdmin();}catch(e){alert(e.message);}}; } catch(e) { alert(e.message); }
  }
});
window.logout = () => FixMyCampusAPI.logout();
