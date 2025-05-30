# Supabase Storage Setup for Avatars

## 1. Create Storage Bucket

Go to your Supabase dashboard → Storage → Create Bucket

**Bucket Details:**

- Name: `avatars`
- Public: `true` (so images can be accessed via public URLs)

## 2. Set up RLS Policies

Navigate to Storage → Policies and add the following policies for the `avatars` bucket:

### Policy 1: Allow public read access

```sql
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

### Policy 2: Allow authenticated users to upload

```sql
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
```

### Policy 3: Allow users to update their own files

```sql
CREATE POLICY "Allow updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
```

### Policy 4: Allow users to delete their own files

```sql
CREATE POLICY "Allow deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
```

## 3. Verify Setup

After creating the bucket and policies, you can test the upload functionality in your application.

## 4. Alternative: Use SQL to create bucket

If you prefer to create the bucket via SQL:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);
```

## Notes

- The bucket is set to public so the uploaded images can be accessed via direct URLs
- Make sure your Supabase client has the correct permissions
- The `useFileImport` hook should work with this bucket configuration
