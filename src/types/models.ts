export type AuthState = {
  token: string | null;
  email: string | null;
  expiresAt: number | null;
};

export type ListItem = {
  id: number;
  title: string;
  description?: string;
  thumbnail?: string;
  price?: number;
  category?: string;
  rating?: number;
  stock?: number;
  brand?: string;
  discountPercentage?: number;
};

export type DetailItem = ListItem & {
  images?: string[];
  tags?: string[];
};

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Detail: { item: ListItem; id: number };
};
