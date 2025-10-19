-- Create table for storing vehicle reports
CREATE TABLE public.vehicle_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  plate VARCHAR(7) NOT NULL,
  report_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vehicle_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view reports" 
ON public.vehicle_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create reports" 
ON public.vehicle_reports 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_vehicle_reports_plate ON public.vehicle_reports(plate);
CREATE INDEX idx_vehicle_reports_created_at ON public.vehicle_reports(created_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vehicle_reports_updated_at
BEFORE UPDATE ON public.vehicle_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();