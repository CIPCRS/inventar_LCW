// Configurare Inventar LCW Offline
// demo: true  -> aplicația rulează fără Firebase, cu stocul din demo-stoc.js și progresul salvat local în browser
// demo: false -> aplicația folosește Firebase (Authentication Email/Password + Cloud Firestore)
window.INV_CONFIG = {
  demo: false,
  titlu: 'Inventar LCW Offline',
  client: 'RO-LCWOFF',

  // Utilizatorii cu drepturi de administrator (nume de login, litere mici, fără diacritice)
  admini: ['cristiana.ene', 'adrian'],

  // Loginul e "nume + PIN"; în Firebase Authentication contul e nume@<domeniuEmail>, parola = "PIN" + PIN-ul.
  // Domeniu separat de aplicația Martur (inventar.local): conturile celor două depozite nu se amestecă.
  domeniuEmail: 'inventar-lcw.local',

  // Prefixul colecțiilor Firestore (lcw_inventare, lcw_config, lcw_utilizatori) — separă datele LCW de Martur în același proiect
  prefix: 'lcw_',

  // Proiectul Firebase inventar-martur (plan Blaze), aplicația web inventar-pda
  firebase: {
    apiKey: 'AIzaSyCDe0WFDc5DQkpy3Q57Bzqh_aE__fpxapA',
    authDomain: 'inventar-martur.firebaseapp.com',
    projectId: 'inventar-martur',
    appId: '1:801794336942:web:ab5dadc348c09593b4a53f'
  }
};
