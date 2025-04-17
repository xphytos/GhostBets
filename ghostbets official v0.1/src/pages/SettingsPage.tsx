
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ChevronLeft, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import HorizontalAdBanner from '@/components/ads/HorizontalAdBanner';
import { Database } from '@/integrations/supabase/types';

// Correct type definition using the Database type
type NotificationSettings = Database['public']['Tables']['user_settings']['Row'];

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    id: '',
    user_id: '',
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setNotificationSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    
    fetchSettings();
  }, [user]);

  const saveNotificationSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error: checkError } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (data) {
        const { error } = await supabase
          .from('user_settings')
          .update({
            email_notifications: notificationSettings.email_notifications,
            push_notifications: notificationSettings.push_notifications,
            sms_notifications: notificationSettings.sms_notifications,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_settings')
          .insert({ 
            user_id: user.id,
            email_notifications: notificationSettings.email_notifications,
            push_notifications: notificationSettings.push_notifications,
            sms_notifications: notificationSettings.sms_notifications,
          });
        
        if (error) throw error;
      }
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = (setting: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-6">
        <div className="flex items-center mb-6 gap-4">
          <Link to="/profile">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        
        <HorizontalAdBanner slot="1234567891" />
        
        <Tabs defaultValue="appearance" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how GhostBets looks on your device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">Theme</div>
                    <div className="text-sm text-muted-foreground">
                      {theme === 'dark' ? 'Dark mode is enabled' : 'Light mode is enabled'}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </div>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings.email_notifications}
                    onCheckedChange={() => handleToggleChange('email_notifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive notifications on your device
                    </div>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notificationSettings.push_notifications}
                    onCheckedChange={() => handleToggleChange('push_notifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive important notifications via SMS
                    </div>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={notificationSettings.sms_notifications}
                    onCheckedChange={() => handleToggleChange('sms_notifications')}
                  />
                </div>
                
                <Button onClick={saveNotificationSettings} disabled={loading}>
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    To update your profile information like username and profile picture, please visit the 
                    <Link to="/profile" className="text-primary font-medium ml-1">Profile Page</Link>.
                  </p>
                  
                  <p className="text-sm">
                    Account email: <span className="font-medium">{user?.email}</span>
                  </p>
                  
                  <div className="pt-4">
                    <Link to="/profile">
                      <Button>Go to Profile</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
