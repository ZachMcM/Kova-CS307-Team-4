import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '@/app/login';

describe("LoginScreen", () => {
    it('Correctly brings up the login screen', () => {
        const { getByText } = render(LoginScreen())
    })
})