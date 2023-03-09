const omit = (obj, ...props) => {
  const result = JSON.parse(JSON.stringify(obj));
  props.forEach(function(prop) {
    delete result[prop];
  });
  return result;
}

module.exports = {omit};