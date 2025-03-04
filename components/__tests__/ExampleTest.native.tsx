import React from 'react'; // Add this import
import { render } from '@testing-library/react-native';
import { describe, it, expect } from '@jest/globals'
import LoginScreen from '@/app/login';
import { signInUser } from '@/services/loginServices';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { SessionProvider } from '../SessionContext';

jest.mock('@/lib/supabase', () => ({
    supabase: {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [{ id: 1, name: 'Test User' }],
          error: null
        }),
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        update: jest.fn().mockResolvedValue({ data: null, error: null }),
        delete: jest.fn().mockResolvedValue({ data: null, error: null })
      }),
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { user: { id: '123' }, session: {} },
          error: null
        }),
        signUp: jest.fn(),
        signIn: jest.fn(),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        startAutoRefresh: jest.fn(),
        stopAutoRefresh: jest.fn()
      }
    }
  }));


describe("Login Test", () => {
    it('Successfully retrieves profile data', async () => {
      // Mock implementation of select
      const result = await supabase.from('profile').select();
      
      // Check that the mocked result is as expected
      expect(result).toBeDefined();
    //   expect(result.data).toEqual([{ id: 1, name: 'Test User' }]);
      expect(result.error).toBeNull();
      
      // Verify that the method was called
      expect(supabase.from).toHaveBeenCalledWith('profile');
    });
  
    it('Successfully signs in a user', async () => {
      const signInResult = await supabase.auth.signInWithPassword({
        email: 'aa@aa.com',
        password: 'Aaa123'
      });
  
      expect(signInResult.data.user).toBeDefined();
      expect(signInResult.error).toBeNull();
    });

    it("actual test method", async () => {
        const result = await signInUser("aa@aa.com", "Aaa123");
        expect(result.user).toBeDefined();
        expect(result.session).toBeDefined();
    })
  });