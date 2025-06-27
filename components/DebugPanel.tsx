import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function DebugPanel() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testConnection = async () => {
    try {
      addResult('🔧 Testing Supabase connection...');
      
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
      
      if (error) {
        addResult(`❌ Connection failed: ${error.message}`);
      } else {
        addResult('✅ Database connection successful!');
      }
    } catch (err) {
      addResult(`❌ Connection error: ${err}`);
    }
  };

  const testAuth = async () => {
    try {
      addResult('🔧 Testing auth system...');
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        addResult(`❌ Auth failed: ${error.message}`);
      } else {
        addResult(`✅ Auth working! Session: ${data.session ? 'exists' : 'none'}`);
      }
    } catch (err) {
      addResult(`❌ Auth error: ${err}`);
    }
  };

  const testTables = async () => {
    try {
      addResult('🔧 Testing required tables...');
      
      // Test each table
      const tables = ['user_profiles', 'civic_actions', 'achievements', 'communities'];
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select('count').limit(1);
          if (error) {
            addResult(`❌ Table ${table}: ${error.message}`);
          } else {
            addResult(`✅ Table ${table}: exists`);
          }
        } catch (err) {
          addResult(`❌ Table ${table}: ${err}`);
        }
      }
    } catch (err) {
      addResult(`❌ Table test error: ${err}`);
    }
  };

  const testTriggerFunction = async () => {
    try {
      addResult('🔧 Testing trigger function existence...');
      
      // Use our custom test function
      const { data, error } = await supabase.rpc('test_trigger_function_exists');
      
      if (error) {
        addResult(`❌ Trigger function check failed: ${error.message}`);
        addResult('⚠️ This suggests the trigger function is not properly created');
      } else if (data === true) {
        addResult('✅ Trigger function exists and is accessible');
      } else {
        addResult('❌ Trigger function does not exist');
        addResult('💡 Run the new migration: 20250626222000_fix_trigger_function.sql');
      }
    } catch (err) {
      addResult(`❌ Trigger function test error: ${err}`);
      addResult('⚠️ This might indicate the function is missing');
    }
  };

  const checkTriggers = async () => {
    try {
      addResult('🔧 Checking database triggers...');
      
      // Use a simpler query that should work in Supabase
      const { data, error } = await supabase
        .rpc('sql', {
          query: `
            SELECT trigger_name, event_manipulation, event_object_table 
            FROM information_schema.triggers 
            WHERE trigger_name = 'on_auth_user_created'
          `
        });
      
      if (error) {
        addResult(`❌ Trigger check failed: ${error.message}`);
        // Try alternative method
        addResult('🔧 Trying alternative trigger check...');
        
        const { data: altData, error: altError } = await supabase
          .rpc('sql', {
            query: `
              SELECT EXISTS (
                SELECT 1 FROM pg_trigger t
                JOIN pg_class c ON t.tgrelid = c.oid
                JOIN pg_namespace n ON c.relnamespace = n.oid
                WHERE t.tgname = 'on_auth_user_created'
                AND c.relname = 'users'
                AND n.nspname = 'auth'
              ) as trigger_exists
            `
          });
          
        if (altError) {
          addResult(`❌ Alternative trigger check failed: ${altError.message}`);
        } else if (altData && altData[0]?.trigger_exists) {
          addResult('✅ Trigger exists on auth.users table');
        } else {
          addResult('❌ Trigger not found - this is likely the issue!');
        }
      } else if (data && data.length > 0) {
        addResult('✅ Trigger exists on auth.users table');
      } else {
        addResult('❌ Trigger not found - this is likely the issue!');
      }
    } catch (err) {
      addResult(`❌ Trigger check error: ${err}`);
    }
  };

  const testSignUpFlow = async () => {
    try {
      addResult('🔧 Testing sign-up flow with test user...');
      
      const testEmail = `test-${Date.now()}@civicspark.test`;
      const testPassword = 'TestPassword123!';
      
      addResult(`📧 Creating test user: ${testEmail}`);
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User',
            display_name: 'Test User',
          }
        }
      });

      if (error) {
        addResult(`❌ Sign-up failed: ${error.message}`);
        addResult(`❌ Error code: ${error.status}`);
        
        // If it's a database error, suggest the new migration
        if (error.message.includes('Database error saving new user')) {
          addResult('💡 Suggestion: Run the new migration file');
          addResult('💡 File: supabase/migrations/20250626222000_fix_trigger_function.sql');
        }
      } else {
        addResult(`✅ Sign-up successful! User ID: ${data.user?.id}`);
        
        // Wait a moment for trigger to execute
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if profile was created
        if (data.user?.id) {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (profileError) {
            addResult(`❌ Profile not created: ${profileError.message}`);
            addResult(`⚠️ This confirms the trigger function is not working`);
          } else {
            addResult(`✅ Profile created successfully!`);
            addResult(`✅ Trigger function is working properly`);
            addResult(`📋 Profile data: ${JSON.stringify(profile, null, 2)}`);
          }
        }
        
        // Clean up test user
        if (data.user?.id) {
          try {
            // Delete profile first
            await supabase.from('user_profiles').delete().eq('id', data.user.id);
            addResult('🧹 Test profile cleaned up');
          } catch (cleanupErr) {
            addResult('⚠️ Cleanup note: Test profile may remain in database');
          }
        }
      }
    } catch (err) {
      addResult(`❌ Sign-up test error: ${err}`);
    }
  };

  const testRLS = async () => {
    try {
      addResult('🔧 Testing Row Level Security...');
      
      // Test if RLS is enabled
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
        
      if (error) {
        if (error.message.includes('permission denied') || error.message.includes('RLS')) {
          addResult('✅ RLS is working (permission denied as expected)');
        } else {
          addResult(`❌ RLS test failed: ${error.message}`);
        }
      } else {
        addResult('⚠️ RLS might not be working (no permission error)');
      }
    } catch (err) {
      addResult(`❌ RLS test error: ${err}`);
    }
  };

  const runFullDiagnostic = async () => {
    addResult('🚀 Running full diagnostic...');
    await testConnection();
    await testAuth();
    await testTables();
    await testTriggerFunction();
    await checkTriggers();
    await testRLS();
    await testSignUpFlow();
    addResult('🏁 Full diagnostic complete!');
  };

  const runNewMigration = async () => {
    addResult('🔧 Instructions for running new migration:');
    addResult('1. Go to your Supabase dashboard');
    addResult('2. Navigate to SQL Editor');
    addResult('3. Copy the contents of: supabase/migrations/20250626222000_fix_trigger_function.sql');
    addResult('4. Paste and run the SQL');
    addResult('5. Come back here and run "Test Trigger Function" to verify');
    addResult('💡 This should fix the trigger function issues');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Enhanced Debug Panel</Text>
      
      <View style={styles.envInfo}>
        <Text style={styles.label}>Supabase URL:</Text>
        <Text style={styles.value}>
          {process.env.EXPO_PUBLIC_SUPABASE_URL ? 
            `${process.env.EXPO_PUBLIC_SUPABASE_URL.substring(0, 30)}...` : 
            '❌ MISSING'
          }
        </Text>
        
        <Text style={styles.label}>Supabase Key:</Text>
        <Text style={styles.value}>
          {process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 
            `${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 
            '❌ MISSING'
          }
        </Text>
      </View>

      <View style={styles.buttonGrid}>
        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={runFullDiagnostic}>
          <Text style={styles.buttonText}>🚀 Run Full Diagnostic</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.fixButton]} onPress={runNewMigration}>
          <Text style={styles.buttonText}>🔧 Migration Instructions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testConnection}>
          <Text style={styles.buttonText}>Test Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testAuth}>
          <Text style={styles.buttonText}>Test Auth</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testTables}>
          <Text style={styles.buttonText}>Test Tables</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testTriggerFunction}>
          <Text style={styles.buttonText}>Test Trigger Func</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={checkTriggers}>
          <Text style={styles.buttonText}>Check Triggers</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testRLS}>
          <Text style={styles.buttonText}>Test RLS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.warningButton]} onPress={testSignUpFlow}>
          <Text style={styles.buttonText}>🧪 Test Sign-Up</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
        <Text style={styles.clearButtonText}>Clear Results</Text>
      </TouchableOpacity>

      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>{result}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 20,
    borderRadius: 10,
    maxHeight: 700,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  envInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
  },
  value: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'monospace',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    minWidth: '30%',
  },
  primaryButton: {
    backgroundColor: '#059669',
    minWidth: '100%',
    padding: 15,
  },
  fixButton: {
    backgroundColor: '#7C3AED',
    minWidth: '100%',
    padding: 15,
  },
  warningButton: {
    backgroundColor: '#EA580C',
    minWidth: '45%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 11,
  },
  clearButton: {
    backgroundColor: '#DC2626',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  clearButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    maxHeight: 250,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 5,
    lineHeight: 16,
  },
});