// src/pages/ResetPassword.tsx
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const ResetSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
});

const ResetPassword = () => {
  return (
    <div>
      <h2>Reset Password</h2>
      <Formik
        initialValues={{ email: '' }}
        validationSchema={ResetSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const res = await axios.post('http://localhost:8080/api/auth/reset-password', values);
            alert(res.data);
          } catch (err: any) {
            alert(err.response?.data || 'Reset failed');
          }
          setSubmitting(false);
        }}
      >
        <Form>
          <div>
            <label>Email:</label>
            <Field type="email" name="email" />
            <ErrorMessage name="email" component="div" />
          </div>
          <button type="submit">Send Reset Link</button>
        </Form>
      </Formik>
    </div>
  );
};

export default ResetPassword;
