const Yup = require('yup');

const formSchema = Yup.object({
  username: Yup.string()
  .required('Username required')
  .min(6, 'Username too short')
  .max(28, 'Username too long'),
  password: Yup.string()
  .required('Password is required')
  .min(6, 'Password too short')
  .max(28, 'Password too long')
})

const validateForm = (req, res, next) => {
  const formData = req.body;
  formSchema.validate(formData)
  .catch(err => {
    res.status(422).send();
    console.log(err.errors)
    return
  }).then(valid => {
    if (valid) {
      next();
    }
  })
}


module.exports = validateForm;