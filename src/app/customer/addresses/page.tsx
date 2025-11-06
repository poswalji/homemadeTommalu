'use client';

import { useState } from 'react';
import { useAuthMe, useUpdateProfile } from '@/hooks/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, MapPin, Edit, Trash2, Check } from 'lucide-react';
import { LocationPicker } from '@/components/maps/location-picker';

export default function CustomerAddressesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const { data: authData, isLoading } = useAuthMe();
  const updateProfile = useUpdateProfile();

  const addresses = authData?.user?.addresses || [];

  const [formData, setFormData] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false,
    coordinates: null as { lat: number; lng: number } | null,
  });

  const handleOpenDialog = (address?: any) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        label: address.label || 'Home',
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        country: address.country || 'India',
        isDefault: address.isDefault || false,
        coordinates: address.coordinates || null,
      });
    } else {
      setEditingAddress(null);
      setFormData({
        label: 'Home',
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        isDefault: addresses.length === 0,
        coordinates: null,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAddress(null);
      setFormData({
        label: 'Home',
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        isDefault: false,
        coordinates: null,
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.street || !formData.city || !formData.pincode) {
      alert('Please fill in all required fields');
      return;
    }

    const newAddresses = [...addresses];
    if (editingAddress) {
      // Update existing address
      const index = newAddresses.findIndex((addr) => addr === editingAddress);
      if (index !== -1) {
        newAddresses[index] = { 
          ...formData, 
          label: formData.label as 'Home' | 'Work' | 'Other' 
        };
      }
    } else {
      // Add new address
      newAddresses.push({ 
        ...formData, 
        label: formData.label as 'Home' | 'Work' | 'Other' 
      });
    }

    // If this is set as default, unset others
    if (formData.isDefault) {
      newAddresses.forEach((addr) => {
        if (addr !== (editingAddress || formData)) {
          addr.isDefault = false;
        }
      });
    }

    try {
      await updateProfile.mutateAsync({ addresses: newAddresses });
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address');
    }
  };

  const handleDelete = async (addressToDelete: any) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    const newAddresses = addresses.filter((addr) => addr !== addressToDelete);
    try {
      await updateProfile.mutateAsync({ addresses: newAddresses });
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address');
    }
  };

  const handleSetDefault = async (address: any) => {
    const newAddresses = addresses.map((addr) => ({
      ...addr,
      isDefault: addr === address,
    }));
    try {
      await updateProfile.mutateAsync({ addresses: newAddresses });
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Failed to set default address');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
          <p className="text-gray-600 mt-2">Manage your delivery addresses</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className="p-12 text-center">
          <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No addresses yet</h3>
          <p className="text-gray-600 mb-6">
            Add your first delivery address to get started
          </p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((address, index) => (
            <Card key={index} className="p-6 relative">
              {address.isDefault && (
                <Badge className="absolute top-4 right-4">Default</Badge>
              )}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold capitalize">{address.label}</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {address.street}
                  <br />
                  {address.city}
                  {address.state && `, ${address.state}`}
                  <br />
                  {address.pincode}
                  {address.country && `, ${address.country}`}
                </p>
              </div>
              <div className="flex gap-2">
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address)}
                    disabled={updateProfile.isPending}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Set Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(address)}
                  disabled={updateProfile.isPending}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(address)}
                  disabled={updateProfile.isPending || address.isDefault}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl ">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? 'Update your delivery address details'
                : 'Add a new delivery address to your account'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2">
                <Label htmlFor="label">Address Label</Label>
                <select
                  id="label"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg mt-1"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <Label>Location on Map</Label>
                <LocationPicker
                  onLocationSelect={(location) => {
                    setFormData({
                      ...formData,
                      street: location.address.split(',')[0] || location.address,
                      city: location.city || '',
                      state: location.state || '',
                      pincode: location.pincode || '',
                      coordinates: { lat: location.lat, lng: location.lng },
                    });
                  }}
                  initialLocation={formData.coordinates || undefined}
                  height="300px"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  placeholder="House/Building number, Street"
                  required
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Select location on map above or enter manually
                </p>
              </div>
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="City"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="State"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData({ ...formData, pincode: e.target.value })
                  }
                  placeholder="Pincode"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="Country"
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      setFormData({ ...formData, isDefault: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Set as default address</span>
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  editingAddress ? 'Update Address' : 'Add Address'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

