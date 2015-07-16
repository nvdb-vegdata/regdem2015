module.exports.parseCookies = function (cookies) {
  // Required cookies for apiskriv
  var searchFor = [
    'iPlanetDirectoryProOAMutv'
  ];

  var list = [];

  cookies && cookies.forEach(function (cookie) {
    if (searchFor.indexOf(cookie.split('=')[0]) > -1) {
      list.push(cookie);
    }
  });

  return list;
}
