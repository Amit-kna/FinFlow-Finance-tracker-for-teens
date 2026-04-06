-- Add missing DELETE policies for lesson_progress and notifications tables

-- Lesson Progress DELETE policy
DROP POLICY IF EXISTS "Users can delete own progress" ON lesson_progress;
CREATE POLICY "Users can delete own progress" ON lesson_progress FOR DELETE USING (auth.uid() = user_id);

-- Notifications DELETE policy
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);
