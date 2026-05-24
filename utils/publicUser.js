/** Safe user snapshot for API responses — never includes password. */
function toPublicUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
  };
}

module.exports = { toPublicUser };
