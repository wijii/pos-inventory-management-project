const staffAjax = {
  getStaffList: function () {
    return fetch("../../backend/routes.php?action=getStaffList")
      .then((r) => r.json());
  },

  addStaff: function (firstname, lastname, username, role, email, phone, password) {
    return fetch("../../backend/routes.php?action=addStaff", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ firstname, lastname, username, role, email, phone, password }),
    }).then((r) => r.json());
  },

  deleteStaff: function (userId) {
    return fetch("../../backend/routes.php?action=deleteStaff", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ userId }),
    }).then((r) => r.json());
  },

  verifyManager: function (password) {
    return fetch("../../backend/routes.php?action=verifyManager", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ password }),
    }).then((r) => r.text());
  }
};
