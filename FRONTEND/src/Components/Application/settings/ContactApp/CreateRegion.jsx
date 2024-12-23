import { NewContacts, AddContacts, Name, Age, Mobile, Save, Cancel } from '../../../../Constant';
import defaultuser from '../../../../assets/images/user/user.png';
import { Btn, Image } from '../../../../AbstractElements';
import React, { Fragment, useState } from 'react';
import { Users } from 'react-feather';
import { Row, Col, Modal, ModalHeader, ModalBody, Label, Input, FormGroup, Form } from 'reactstrap';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';

const CreateContact = () => {
  const [modal, setModal] = useState(false);
  
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
      const checkResponse = await fetch('http://localhost:3002/api/region');
      const existingRegions = await checkResponse.json();
      
      if (existingRegions.data.some(region => region.code === data.code.toUpperCase())) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Region code already exists',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3085d6'
        });
        return;
      }

      const response = await fetch('http://localhost:3002/api/region/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: data.code.toUpperCase(),
          name: data.name.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
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
        throw new Error(result.message || 'Error creating region');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Creation Failed',
        text: error.message || 'Failed to create region',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6'
      });
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
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

export default CreateContact;
