import { NewContacts, AddContacts, Name, Age, Mobile, Save, Cancel } from '../../../../Constant';
import defaultuser from '../../../../assets/images/user/user.png';
import { Btn, Image } from '../../../../AbstractElements';
import React, { Fragment, useState } from 'react';
import { Users } from 'react-feather';
import { Row, Col, Modal, ModalHeader, ModalBody, Label, Input, FormGroup, Form } from 'reactstrap';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import axios from "../../../../utils/axios";
import config from "../../../../config";

const CreateContact = () => {
  const [modal, setModal] = useState(false);
  const [error, setError] = useState(null);
  
  const toggle = () => {
    setModal(!modal);
    clearErrors();
    reset();
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    reset,
  } = useForm();

  const validateRegionCode = (code) => {
    const codeRegex = /^[A-Z]{3,4}$/;
    return codeRegex.test(code) || "Region code must be 3-4 uppercase letters";
  };

  const AddContact = async (data) => {
    try {
      // Check if region code already exists
      const checkResponse = await axios.get(`/region`);
      const existingRegions = checkResponse.data.data;
      
      if (existingRegions.some(region => region.code === data.code.toUpperCase())) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Region code already exists',
          confirmButtonText: 'OK',
        });
        return;
      }

      const response = await axios.post(`/region/create`, {
        code: data.code.toUpperCase(),
        name: data.name.trim(),
      });

      if (response.data && response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Region created successfully',
          timer: 1500,
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });
        setModal(false);
        reset();
      } else {
        throw new Error(response.data.message || 'Error creating region');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError(error.response?.data?.message || "Failed to create region");
      }
    }
  };

  return (
    <Fragment>
      <Btn attrBtn={{ className: 'badge-light-primary align-items-center btn-mail d-flex justify-content-start w-100 emptyContact', color: 'primery', onClick: toggle }}>
        <Users className='me-2' />
        New Region
      </Btn>
      <Modal className='modal-bookmark' isOpen={modal} toggle={toggle} size='lg'>
        <ModalHeader toggle={toggle}>Add Region</ModalHeader>
        <ModalBody>
          <Form className='form-bookmark needs-validation' onSubmit={handleSubmit(AddContact)}>
            <div className='form-row'>
              <FormGroup className='col-md-12'>
                <Label>Region Code</Label>
                <input
                  className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                  name='code'
                  type='text'
                  placeholder='e.g., TVM'
                  {...register('code', { 
                    required: 'Region code is required',
                    validate: validateRegionCode,
                    setValueAs: value => value.toUpperCase()
                  })}
                />
                {errors.code && (
                  <div className='invalid-feedback d-block'>
                    {errors.code.message}
                  </div>
                )}
              </FormGroup>
              <FormGroup className='col-md-12'>
                <Label>Region Name</Label>
                <input
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  name='name'
                  type='text'
                  placeholder='e.g., Trivandrum'
                  {...register('name', { 
                    required: 'Region name is required',
                    minLength: { value: 3, message: 'Region name must be at least 3 characters' },
                    maxLength: { value: 50, message: 'Region name must not exceed 50 characters' },
                    pattern: {
                      value: /^[a-zA-Z\s]+$/,
                      message: 'Region name can only contain letters and spaces'
                    }
                  })}
                />
                {errors.name && (
                  <div className='invalid-feedback d-block'>
                    {errors.name.message}
                  </div>
                )}
              </FormGroup>
            </div>
            <Btn attrBtn={{ color: 'secondary', className: 'me-2' }} type='submit'>{Save}</Btn>
            <Btn attrBtn={{ color: 'primary', onClick: toggle }}>{Cancel}</Btn>
          </Form>
          {error && (
            <div className='alert alert-danger mt-3'>{error}</div>
          )}
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

export default CreateContact;
