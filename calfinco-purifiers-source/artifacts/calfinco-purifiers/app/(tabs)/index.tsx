import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { CATEGORIES, PRODUCTS, type Product } from "@/data/catalog";
import {
  type DemoRole,
  type OrderStatus,
  useDemoStore,
} from "@/hooks/useDemoStore";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMemo, useState } from "react";

type Section =
  | "shop"
  | "orders"
  | "service"
  | "profile"
  | "cart"
  | "product"
  | "overview"
  | "dealers"
  | "content";

const formatCurrency = (amount: number) =>
  `₹${Math.round(amount).toLocaleString("en-IN")}`;

const orderStatuses: OrderStatus[] = [
  "Pending approval",
  "Confirmed",
  "In transit",
  "Delivered",
];

function StoreButton({
  label,
  onPress,
  secondary = false,
  disabled = false,
  compact = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  compact?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        compact && styles.compactButton,
        {
          backgroundColor: secondary ? colors.secondary : colors.primary,
          opacity: disabled ? 0.45 : pressed ? 0.78 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.actionButtonText,
          { color: secondary ? colors.secondaryForeground : colors.primaryForeground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function StatusTag({ label }: { label: string }) {
  const colors = useColors();
  const isPending =
    label.toLowerCase().includes("pending") ||
    label.toLowerCase().includes("requested");
  return (
    <View
      style={[
        styles.statusTag,
        { backgroundColor: isPending ? colors.accent : colors.secondary },
      ]}
    >
      <Text
        style={[
          styles.statusText,
          { color: isPending ? colors.accentForeground : colors.secondaryForeground },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function ProductCard({
  product,
  dealer,
  onOpen,
  onAdd,
}: {
  product: Product;
  dealer: boolean;
  onOpen: () => void;
  onAdd: () => void;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.productCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Pressable onPress={onOpen} accessibilityRole="button">
        <View style={[styles.productImageWrap, { backgroundColor: colors.secondary }]}>
          <Image source={product.image} style={styles.productImage} resizeMode="contain" />
          <View style={styles.ratingBadge}>
            <Feather name="star" size={11} color={colors.accentForeground} />
            <Text style={[styles.ratingText, { color: colors.accentForeground }]}>
              {product.rating}
            </Text>
          </View>
        </View>
        <View style={styles.productInfo}>
          <Text style={[styles.productCategory, { color: colors.mutedForeground }]}>
            {product.category}
          </Text>
          <Text numberOfLines={2} style={[styles.productName, { color: colors.foreground }]}>
            {product.name}
          </Text>
          <Text numberOfLines={1} style={[styles.productDescription, { color: colors.mutedForeground }]}>
            {product.description}
          </Text>
          <Text style={[styles.price, { color: colors.foreground }]}>
            {formatCurrency(dealer ? product.dealerPrice : product.price)}
          </Text>
          {dealer ? (
            <Text style={[styles.dealerPriceLabel, { color: colors.primary }]}>
              Wholesale price
            </Text>
          ) : null}
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Add ${product.name} to cart`}
        testID={`add-${product.id}`}
        onPress={onAdd}
        style={[styles.addIconButton, { backgroundColor: colors.primary }]}
      >
        <Feather name="plus" size={18} color={colors.primaryForeground} />
      </Pressable>
    </View>
  );
}

export default function StoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const store = useDemoStore();
  const [role, setRole] = useState<DemoRole>("customer");
  const [section, setSection] = useState<Section>("shop");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState("");
  const [customerName, setCustomerName] = useState("Ananya Rao");
  const [serviceName, setServiceName] = useState("");
  const [servicePhone, setServicePhone] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");
  const [serviceIssue, setServiceIssue] = useState("Installation");

  const isAdmin = role === "admin";
  const isDealer = role === "dealer";
  const filteredProducts = useMemo(
    () =>
      PRODUCTS.filter((product) => {
        const matchesCategory =
          category === "All" || product.category === category;
        const term = search.trim().toLowerCase();
        return (
          matchesCategory &&
          (!term ||
            product.name.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term))
        );
      }),
    [category, search],
  );
  const cartCount = store.cart.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotal = store.cart.reduce((sum, line) => {
    const product = PRODUCTS.find((item) => item.id === line.productId);
    return (
      sum +
      (product
        ? (isDealer ? product.dealerPrice : product.price) * line.quantity
        : 0)
    );
  }, 0);

  const navItems: {
    key: Section;
    label: string;
    icon: keyof typeof Feather.glyphMap;
  }[] = isAdmin
    ? [
        { key: "overview", label: "Overview", icon: "grid" },
        { key: "orders", label: "Orders", icon: "package" },
        { key: "dealers", label: "Dealers", icon: "users" },
        { key: "content", label: "Posts", icon: "send" },
      ]
    : [
        { key: "shop", label: "Shop", icon: "shopping-bag" },
        { key: "orders", label: "Orders", icon: "package" },
        { key: "service", label: "Service", icon: "tool" },
        { key: "profile", label: "Account", icon: "user" },
      ];

  const notify = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2800);
  };

  const changeRole = (nextRole: DemoRole) => {
    void Haptics.selectionAsync();
    setRole(nextRole);
    setSection(nextRole === "admin" ? "overview" : "shop");
    setSelectedProduct(null);
    setSearch("");
  };

  const addProduct = (product: Product) => {
    void Haptics.selectionAsync();
    store.addToCart(product.id);
    notify(`${product.name} added to your bag`);
  };

  const submitOrder = () => {
    const units = store.cart.reduce((sum, line) => sum + line.quantity, 0);
    if (isDealer && units < 5) {
      notify("Dealer orders start at 5 units");
      return;
    }
    const order = store.placeOrder(customerName, isDealer ? "dealer" : "customer");
    if (!order) {
      notify("Your bag is empty");
      return;
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSection("orders");
    notify(`${order.id} placed successfully`);
  };

  const submitServiceRequest = () => {
    if (!serviceName.trim() || servicePhone.trim().length < 10 || !serviceAddress.trim()) {
      notify("Add your name, a valid phone number, and address");
      return;
    }
    store.addServiceRequest({
      name: serviceName.trim(),
      phone: servicePhone.trim(),
      address: serviceAddress.trim(),
      issue: serviceIssue,
    });
    setServiceName("");
    setServicePhone("");
    setServiceAddress("");
    notify("Service request saved on this device");
  };

  const roleLabels: { role: DemoRole; label: string }[] = [
    { role: "customer", label: "Customer" },
    { role: "dealer", label: "Dealer" },
    { role: "admin", label: "Admin" },
  ];

  const pageTitle =
    section === "cart"
      ? "Your bag"
      : section === "orders"
        ? isAdmin
          ? "Order desk"
          : "Your orders"
        : section === "service"
          ? "Book a service"
          : section === "profile"
            ? "Your account"
            : section === "dealers"
              ? "Dealer applications"
              : section === "content"
                ? "Daily content"
                : section === "overview"
                  ? "Admin overview"
                  : section === "product"
                    ? selectedProduct?.name ?? "Product"
                    : "Good water, made simple";

  const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );

  const renderShop = () => (
    <>
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroEyebrow, { color: colors.accent }]}>
            WATER, MADE BETTER
          </Text>
          <Text style={[styles.heroTitle, { color: colors.primaryForeground }]}>
            Pure water{`\n`}for every day.
          </Text>
          <Text style={[styles.heroText, { color: colors.primaryForeground }]}>
            Find the right purifier for your home.
          </Text>
          <Pressable
            onPress={() => {
              setCategory("RO Purifiers");
              setSearch("");
            }}
            style={[styles.heroButton, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.heroButtonText, { color: colors.primary }]}>
              Explore RO
            </Text>
            <Feather name="arrow-up-right" size={15} color={colors.primary} />
          </Pressable>
        </View>
        <Image
          source={PRODUCTS[0].image}
          style={styles.heroImage}
          resizeMode="contain"
        />
        <View style={[styles.heroCircle, { backgroundColor: colors.accent }]} />
      </View>

      <View style={styles.sectionHeaderRow}>
        <SectionHeader title="Shop by category" subtitle="Built around your water" />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {CATEGORIES.map((item) => {
          const active = category === item;
          return (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: active ? colors.primaryForeground : colors.foreground },
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.sectionHeaderRow}>
        <SectionHeader
          title={search ? "Search results" : isDealer ? "Wholesale catalogue" : "Popular picks"}
          subtitle={`${filteredProducts.length} products · ${isDealer ? "dealer pricing" : "free delivery over ₹999"}`}
        />
      </View>
      {filteredProducts.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={24} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No products found</Text>
          <Text style={[styles.muted, { color: colors.mutedForeground }]}>
            Try another product name or category.
          </Text>
        </View>
      ) : (
        <View style={styles.productGrid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              dealer={isDealer}
              onOpen={() => {
                setSelectedProduct(product);
                setSection("product");
              }}
              onAdd={() => addProduct(product)}
            />
          ))}
        </View>
      )}
    </>
  );

  const renderOrders = () => {
    const orders = isAdmin
      ? store.orders
      : store.orders.filter((order) => order.role === role);
    return (
      <>
        <SectionHeader
          title={pageTitle}
          subtitle={isAdmin ? "Review and move each order forward." : "Track your recent purchases."}
        />
        {orders.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="package" size={26} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No orders yet</Text>
            <Text style={[styles.muted, { color: colors.mutedForeground }]}>
              Your orders will appear here after checkout.
            </Text>
            {!isAdmin ? (
              <StoreButton label="Browse products" onPress={() => setSection("shop")} />
            ) : null}
          </View>
        ) : (
          orders.map((order) => (
            <View
              key={order.id}
              style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.rowBetween}>
                <View>
                  <Text style={[styles.orderId, { color: colors.foreground }]}>{order.id}</Text>
                  <Text style={[styles.muted, { color: colors.mutedForeground }]}>
                    {order.customerName} · {order.placedAt}
                  </Text>
                </View>
                <StatusTag label={order.status} />
              </View>
              <View style={[styles.thinRule, { backgroundColor: colors.border }]} />
              <Text style={[styles.muted, { color: colors.mutedForeground }]}>
                {order.items.reduce((sum, line) => sum + line.quantity, 0)} items · {order.paymentStatus}
              </Text>
              <View style={styles.rowBetween}>
                <Text style={[styles.price, { color: colors.foreground }]}>{formatCurrency(order.total)}</Text>
                {isAdmin ? (
                  <StoreButton
                    compact
                    label={order.status === "Delivered" ? "Delivered" : "Advance status"}
                    disabled={order.status === "Delivered"}
                    onPress={() => {
                      const nextIndex = Math.min(
                        orderStatuses.indexOf(order.status) + 1,
                        orderStatuses.length - 1,
                      );
                      store.updateOrderStatus(order.id, orderStatuses[nextIndex]);
                    }}
                  />
                ) : null}
              </View>
            </View>
          ))
        )}
      </>
    );
  };

  const renderService = () => (
    <View style={styles.formContent}>
      <SectionHeader
        title="Book a service"
        subtitle="Request installation, maintenance, or a repair visit."
      />
      <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Service type</Text>
        <View style={styles.issueOptions}>
          {["Installation", "Maintenance", "Repair"].map((issue) => {
            const active = serviceIssue === issue;
            return (
              <Pressable
                key={issue}
                onPress={() => setServiceIssue(issue)}
                style={[
                  styles.issueChip,
                  {
                    backgroundColor: active ? colors.primary : colors.secondary,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? colors.primaryForeground : colors.foreground,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {issue}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={serviceName}
          onChangeText={setServiceName}
          placeholder="Your name"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
          testID="service-name"
        />
        <TextInput
          value={servicePhone}
          onChangeText={setServicePhone}
          placeholder="Phone number"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="phone-pad"
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
          testID="service-phone"
        />
        <TextInput
          value={serviceAddress}
          onChangeText={setServiceAddress}
          placeholder="Service address"
          placeholderTextColor={colors.mutedForeground}
          multiline
          style={[styles.input, styles.addressInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
          testID="service-address"
        />
        <StoreButton label="Request a visit" onPress={submitServiceRequest} />
        <Text style={[styles.formFootnote, { color: colors.mutedForeground }]}>
          Demo requests are saved on this device. Live email/SMS notifications are not connected.
        </Text>
      </View>
      {store.serviceRequests.length ? (
        <>
          <SectionHeader title="Your service requests" />
          {store.serviceRequests.map((request) => (
            <View key={request.id} style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.rowBetween}>
                <Text style={[styles.orderId, { color: colors.foreground }]}>{request.issue}</Text>
                <StatusTag label={request.status} />
              </View>
              <Text style={[styles.muted, { color: colors.mutedForeground }]}>
                {request.id} · {request.address}
              </Text>
            </View>
          ))}
        </>
      ) : null}
    </View>
  );

  const renderCart = () => (
    <>
      <SectionHeader title="Your bag" subtitle={`${cartCount} items`} />
      {!store.cart.length ? (
        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="shopping-bag" size={26} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your bag is empty</Text>
          <Text style={[styles.muted, { color: colors.mutedForeground }]}>
            Add a purifier or a replacement filter to get started.
          </Text>
          <StoreButton label="Continue shopping" onPress={() => setSection("shop")} />
        </View>
      ) : (
        <>
          {store.cart.map((line) => {
            const product = PRODUCTS.find((item) => item.id === line.productId);
            if (!product) return null;
            return (
              <View
                key={line.productId}
                style={[styles.cartLine, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Image source={product.image} style={styles.cartImage} resizeMode="contain" />
                <View style={styles.cartDetails}>
                  <Text style={[styles.productName, { color: colors.foreground }]}>{product.name}</Text>
                  <Text style={[styles.muted, { color: colors.mutedForeground }]}>
                    {formatCurrency(isDealer ? product.dealerPrice : product.price)} each
                  </Text>
                  <View style={styles.quantityRow}>
                    <Pressable
                      onPress={() => store.setQuantity(product.id, line.quantity - 1)}
                      style={[styles.quantityButton, { borderColor: colors.border }]}
                      accessibilityLabel="Decrease quantity"
                    >
                      <Feather name="minus" size={14} color={colors.foreground} />
                    </Pressable>
                    <Text style={[styles.quantityText, { color: colors.foreground }]}>{line.quantity}</Text>
                    <Pressable
                      onPress={() => store.setQuantity(product.id, line.quantity + 1)}
                      style={[styles.quantityButton, { borderColor: colors.border }]}
                      accessibilityLabel="Increase quantity"
                    >
                      <Feather name="plus" size={14} color={colors.foreground} />
                    </Pressable>
                  </View>
                </View>
                <Text style={[styles.price, { color: colors.foreground }]}>
                  {formatCurrency((isDealer ? product.dealerPrice : product.price) * line.quantity)}
                </Text>
              </View>
            );
          })}
          <View style={[styles.checkoutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Checkout</Text>
            <TextInput
              value={customerName}
              onChangeText={setCustomerName}
              placeholder={isDealer ? "Business name" : "Your name"}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
            />
            <View style={styles.rowBetween}>
              <Text style={[styles.muted, { color: colors.mutedForeground }]}>Subtotal</Text>
              <Text style={[styles.price, { color: colors.foreground }]}>{formatCurrency(cartTotal)}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={[styles.muted, { color: colors.mutedForeground }]}>Delivery</Text>
              <Text style={[styles.muted, { color: colors.primary }]}>Free</Text>
            </View>
            <View style={[styles.thinRule, { backgroundColor: colors.border }]} />
            <View style={styles.rowBetween}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Total</Text>
              <Text style={[styles.price, { color: colors.foreground }]}>{formatCurrency(cartTotal)}</Text>
            </View>
            <View style={[styles.setupNotice, { backgroundColor: colors.secondary }]}>
              <Feather name="info" size={16} color={colors.primary} />
              <Text style={[styles.setupText, { color: colors.secondaryForeground }]}>
                Razorpay test checkout is not connected. Demo checkout uses cash on delivery.
              </Text>
            </View>
            {isDealer ? (
              <Text style={[styles.formFootnote, { color: colors.mutedForeground }]}>
                Minimum dealer order: 5 units. Orders require admin approval.
              </Text>
            ) : null}
            <StoreButton
              label={isDealer ? "Place wholesale order" : "Place COD order"}
              onPress={submitOrder}
              disabled={isDealer && cartCount < 5}
            />
          </View>
        </>
      )}
    </>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Pressable
          onPress={() => setSection("shop")}
          style={styles.backButton}
          accessibilityRole="button"
        >
          <Feather name="arrow-left" size={18} color={colors.foreground} />
          <Text style={[styles.backText, { color: colors.foreground }]}>Back to shop</Text>
        </Pressable>
        <View style={[styles.detailImageWrap, { backgroundColor: colors.secondary }]}>
          <Image source={selectedProduct.image} style={styles.detailImage} resizeMode="contain" />
        </View>
        <StatusTag label={selectedProduct.category} />
        <Text style={[styles.detailTitle, { color: colors.foreground }]}>{selectedProduct.name}</Text>
        <Text style={[styles.muted, { color: colors.mutedForeground }]}>
          {selectedProduct.rating} rating · {selectedProduct.reviews} reviews
        </Text>
        <Text style={[styles.detailDescription, { color: colors.mutedForeground }]}>
          {selectedProduct.description}. Designed for dependable everyday performance, easy maintenance, and clean-tasting water.
        </Text>
        <Text style={[styles.detailPrice, { color: colors.foreground }]}>
          {formatCurrency(isDealer ? selectedProduct.dealerPrice : selectedProduct.price)}
        </Text>
        <StoreButton
          label="Add to bag"
          onPress={() => {
            addProduct(selectedProduct);
            setSection("shop");
          }}
        />
      </View>
    );
  };

  const renderProfile = () => (
    <>
      <SectionHeader title="Your account" subtitle="Demo account · changes stay on this device" />
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Feather name="user" size={24} color={colors.accentForeground} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.orderId, { color: colors.foreground }]}>{customerName}</Text>
          <Text style={[styles.muted, { color: colors.mutedForeground }]}>
            {isDealer ? "Wholesale account · demo pricing" : "Customer account · demo mode"}
          </Text>
        </View>
      </View>
      {isDealer ? (
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SectionHeader title="Dealer account" subtitle="Dealer pricing is enabled in this demo." />
          <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>
            The admin demo can approve or decline dealer applications. Real sign-in and account permissions still need Firebase setup.
          </Text>
          <StoreButton
            label="View wholesale orders"
            secondary
            onPress={() => setSection("orders")}
          />
        </View>
      ) : (
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SectionHeader title="Your service" subtitle={`${store.serviceRequests.length} requests on this device`} />
          <StoreButton label="Book a service visit" onPress={() => setSection("service")} />
        </View>
      )}
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Cloud account</Text>
        <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>
          Firebase is not connected in this workspace. Orders and service requests currently use on-device demo storage.
        </Text>
      </View>
    </>
  );

  const renderAdminOverview = () => (
    <>
      <SectionHeader title="Today's snapshot" subtitle="Demo operations dashboard" />
      <View style={styles.metricsGrid}>
        {[
          ["Orders", String(store.orders.length), "package"],
          ["To approve", String(store.orders.filter((item) => item.status === "Pending approval").length), "clock"],
          ["Dealers", String(store.dealers.filter((item) => item.status === "Pending").length), "users"],
          ["Service", String(store.serviceRequests.length), "tool"],
        ].map(([label, value, icon]) => (
          <View key={label} style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name={icon as keyof typeof Feather.glyphMap} size={18} color={colors.primary} />
            <Text style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text>
            <Text style={[styles.muted, { color: colors.mutedForeground }]}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.sectionHeaderRow}>
        <SectionHeader title="Needs attention" subtitle="Work through the latest requests" />
      </View>
      {store.orders.slice(0, 2).map((order) => (
        <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[styles.orderId, { color: colors.foreground }]}>{order.id}</Text>
              <Text style={[styles.muted, { color: colors.mutedForeground }]}>{order.customerName}</Text>
            </View>
            <StatusTag label={order.status} />
          </View>
          <StoreButton compact label="Open order desk" onPress={() => setSection("orders")} />
        </View>
      ))}
      <View style={[styles.integrationCard, { backgroundColor: colors.secondary }]}>
        <View style={styles.row}>
          <MaterialCommunityIcons name="cloud-alert-outline" size={20} color={colors.primary} />
          <Text style={[styles.orderId, { color: colors.foreground }]}>External services need setup</Text>
        </View>
        <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>
          Firebase, Razorpay, and Instagram are not connected. No cloud sync, online payment, or social publishing is running.
        </Text>
      </View>
    </>
  );

  const renderDealers = () => (
    <>
      <SectionHeader title="Dealer applications" subtitle="Approve access to wholesale prices." />
      {store.dealers.map((dealer) => (
        <View key={dealer.id} style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.orderId, { color: colors.foreground }]}>{dealer.business}</Text>
              <Text style={[styles.muted, { color: colors.mutedForeground }]}>{dealer.contact}</Text>
            </View>
            <StatusTag label={dealer.status} />
          </View>
          {dealer.status === "Pending" ? (
            <View style={styles.buttonRow}>
              <View style={{ flex: 1 }}>
                <StoreButton
                  compact
                  label="Approve"
                  onPress={() => store.updateDealerStatus(dealer.id, "Approved")}
                />
              </View>
              <View style={{ flex: 1 }}>
                <StoreButton
                  compact
                  secondary
                  label="Decline"
                  onPress={() => store.updateDealerStatus(dealer.id, "Declined")}
                />
              </View>
            </View>
          ) : null}
        </View>
      ))}
    </>
  );

  const renderContentAutomation = () => (
    <>
      <SectionHeader title="Daily content" subtitle="Instagram product-post automation" />
      <View style={[styles.socialHero, { backgroundColor: colors.primary }]}>
        <View style={[styles.socialIcon, { backgroundColor: colors.accent }]}>
          <Feather name="send" size={20} color={colors.accentForeground} />
        </View>
        <Text style={[styles.socialTitle, { color: colors.primaryForeground }]}>
          One product story, every day.
        </Text>
        <Text style={[styles.socialDescription, { color: colors.primaryForeground }]}>
          The daily workflow is not active because no Instagram account was connected.
        </Text>
        <StatusTag label="Publishing off" />
      </View>
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>What is still required</Text>
        {[
          "Connect a professional Instagram account",
          "Add an AI caption and image-generation workflow",
          "Schedule a daily job and enable publishing permissions",
        ].map((item, index) => (
          <View key={item} style={styles.checkRow}>
            <View style={[styles.stepCircle, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.stepNumber, { color: colors.primary }]}>{index + 1}</Text>
            </View>
            <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>{item}</Text>
          </View>
        ))}
        <Text style={[styles.formFootnote, { color: colors.mutedForeground }]}>
          No posts have been generated or published. This status is intentionally explicit.
        </Text>
      </View>
    </>
  );

  const renderSection = () => {
    if (section === "cart") return renderCart();
    if (section === "product") return renderProductDetail();
    if (section === "orders") return renderOrders();
    if (section === "service") return renderService();
    if (section === "profile") return renderProfile();
    if (section === "overview") return renderAdminOverview();
    if (section === "dealers") return renderDealers();
    if (section === "content") return renderContentAutomation();
    return renderShop();
  };

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === "web" ? 67 : insets.top,
        },
      ]}
    >
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <Image source={require("../../assets/images/icon.png")} style={styles.brandIcon} />
          <View>
            <Text style={[styles.brandName, { color: colors.foreground }]}>Calfinco</Text>
            <Text style={[styles.brandSubtitle, { color: colors.mutedForeground }]}>WATER CARE</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open shopping bag"
          testID="open-cart"
          onPress={() => setSection("cart")}
          style={[styles.cartButton, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="shopping-bag" size={20} color={colors.foreground} />
          {cartCount > 0 ? (
            <View style={[styles.cartCount, { backgroundColor: colors.primary }]}>
              <Text style={[styles.cartCountText, { color: colors.primaryForeground }]}>{cartCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={[styles.demoBanner, { backgroundColor: colors.secondary }]}>
        <Feather name="eye" size={14} color={colors.primary} />
        <Text style={[styles.demoBannerText, { color: colors.secondaryForeground }]}>
          Demo access · switch roles to explore all flows
        </Text>
      </View>

      <View style={[styles.roleSwitch, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {roleLabels.map((item) => {
          const active = role === item.role;
          return (
            <Pressable
              key={item.role}
              testID={`role-${item.role}`}
              onPress={() => changeRole(item.role)}
              style={[
                styles.roleOption,
                active && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  { color: active ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {section === "shop" ? (
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search purifiers, filters, parts"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
            returnKeyType="search"
            testID="product-search"
          />
          {search ? (
            <Pressable onPress={() => setSearch("")} accessibilityLabel="Clear search">
              <Feather name="x-circle" size={17} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {section !== "shop" && section !== "cart" && section !== "product" ? (
        <View style={styles.screenTitleRow}>
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>{pageTitle}</Text>
          {section === "orders" && !isAdmin ? (
            <Pressable onPress={() => setSection("shop")} style={[styles.smallIconButton, { backgroundColor: colors.secondary }]}>
              <Feather name="plus" size={18} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {section === "cart" || section === "product" ? (
        <View style={styles.screenTitleRow}>
          <Pressable onPress={() => setSection("shop")} style={styles.backButton}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
            <Text style={[styles.backText, { color: colors.foreground }]}>{pageTitle}</Text>
          </Pressable>
        </View>
      ) : null}

      <KeyboardAwareScrollViewCompat
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: Platform.OS === "web" ? 124 : 112 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        bottomOffset={80}
        showsVerticalScrollIndicator={false}
      >
        {renderSection()}
        {isAdmin && section === "overview" && store.serviceRequests.length ? (
          <View style={styles.sectionHeaderRow}>
            <SectionHeader title="Service desk" subtitle={`${store.serviceRequests.length} requests`} />
            {store.serviceRequests.map((request) => (
              <View key={request.id} style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.rowBetween}>
                  <Text style={[styles.orderId, { color: colors.foreground }]}>{request.issue} · {request.name}</Text>
                  <StatusTag label={request.status} />
                </View>
                <Text style={[styles.muted, { color: colors.mutedForeground }]}>{request.phone} · {request.address}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </KeyboardAwareScrollViewCompat>

      {message ? (
        <View style={[styles.toast, { backgroundColor: colors.foreground }]}>
          <Feather name="check-circle" size={16} color={colors.accent} />
          <Text style={[styles.toastText, { color: colors.card }]}>{message}</Text>
        </View>
      ) : null}

      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            bottom: Platform.OS === "web" ? 34 : Math.max(insets.bottom, 8),
          },
        ]}
      >
        {navItems.map((item) => {
          const active = section === item.key || (section === "product" && item.key === "shop");
          return (
            <Pressable
              key={item.key}
              testID={`nav-${item.key}`}
              accessibilityRole="button"
              onPress={() => {
                setSelectedProduct(null);
                setSection(item.key);
              }}
              style={styles.navButton}
            >
              <Feather
                name={item.icon}
                size={19}
                color={active ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.navLabel,
                  { color: active ? colors.primary : colors.mutedForeground },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    minHeight: 54,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandIcon: { width: 38, height: 38, borderRadius: 12 },
  brandName: { fontSize: 17, fontWeight: "700", letterSpacing: -0.4 },
  brandSubtitle: { fontSize: 8, fontWeight: "700", letterSpacing: 1.4, marginTop: 1 },
  cartButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cartCount: {
    position: "absolute",
    right: -4,
    top: -4,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  cartCountText: { fontSize: 9, fontWeight: "700" },
  demoBanner: {
    marginHorizontal: 18,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  demoBannerText: { fontSize: 11, fontWeight: "500" },
  roleSwitch: {
    marginHorizontal: 18,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    flexDirection: "row",
  },
  roleOption: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 10 },
  roleText: { fontSize: 12, fontWeight: "600" },
  searchBox: {
    marginHorizontal: 18,
    marginBottom: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 0 },
  screenTitleRow: {
    paddingHorizontal: 20,
    marginBottom: 8,
    minHeight: 37,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  screenTitle: { fontSize: 20, fontWeight: "700", letterSpacing: -0.4 },
  content: { flex: 1 },
  contentContainer: { paddingHorizontal: 18, paddingTop: 2, gap: 12 },
  hero: {
    minHeight: 184,
    borderRadius: 22,
    overflow: "hidden",
    padding: 18,
    justifyContent: "center",
    position: "relative",
  },
  heroCopy: { width: "64%", zIndex: 2 },
  heroEyebrow: { fontSize: 9, fontWeight: "700", letterSpacing: 1.5, marginBottom: 8 },
  heroTitle: { fontSize: 25, lineHeight: 29, letterSpacing: -0.7, fontWeight: "700" },
  heroText: { fontSize: 11, opacity: 0.88, marginTop: 7, maxWidth: 180 },
  heroButton: {
    alignSelf: "flex-start",
    marginTop: 14,
    borderRadius: 11,
    paddingVertical: 8,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  heroButtonText: { fontSize: 11, fontWeight: "700" },
  heroImage: { position: "absolute", right: -10, bottom: -10, width: 155, height: 165, zIndex: 1 },
  heroCircle: { position: "absolute", right: 14, top: 12, width: 105, height: 105, borderRadius: 55, opacity: 0.4 },
  sectionHeaderRow: { marginTop: 5, marginBottom: 0 },
  sectionHeader: { gap: 3, marginBottom: 6 },
  sectionTitle: { fontSize: 17, fontWeight: "700", letterSpacing: -0.3 },
  sectionSubtitle: { fontSize: 11, lineHeight: 16 },
  categoryRow: { gap: 8, paddingVertical: 3, paddingRight: 18 },
  categoryChip: { borderRadius: 12, borderWidth: 1, paddingVertical: 9, paddingHorizontal: 13 },
  categoryText: { fontSize: 11, fontWeight: "600" },
  productGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  productCard: {
    width: "48.3%",
    borderRadius: 17,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  productImageWrap: { height: 125, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  productImage: { width: "100%", height: "100%" },
  ratingBadge: {
    position: "absolute",
    left: 8,
    top: 8,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  ratingText: { fontSize: 9, fontWeight: "700" },
  productInfo: { padding: 10, paddingBottom: 13 },
  productCategory: { fontSize: 9, fontWeight: "600", marginBottom: 4 },
  productName: { fontSize: 12, fontWeight: "700", lineHeight: 16 },
  productDescription: { fontSize: 9, marginTop: 4 },
  price: { fontSize: 14, fontWeight: "700", marginTop: 8 },
  dealerPriceLabel: { fontSize: 9, fontWeight: "600", marginTop: 2 },
  addIconButton: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 29,
    height: 29,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    minHeight: 45,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 8,
  },
  compactButton: { minHeight: 35, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 11 },
  actionButtonText: { fontSize: 12, fontWeight: "700" },
  emptyState: { borderWidth: 1, borderRadius: 18, padding: 24, alignItems: "center", gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  muted: { fontSize: 11, lineHeight: 16 },
  orderCard: { borderWidth: 1, borderRadius: 17, padding: 14, gap: 9 },
  orderId: { fontSize: 13, fontWeight: "700" },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 9 },
  statusTag: { borderRadius: 9, paddingVertical: 5, paddingHorizontal: 8, alignSelf: "flex-start" },
  statusText: { fontSize: 9, fontWeight: "700" },
  thinRule: { height: 1, marginVertical: 2 },
  formContent: { paddingBottom: 20, gap: 12 },
  formCard: { borderWidth: 1, borderRadius: 18, padding: 15, gap: 11 },
  fieldLabel: { fontSize: 12, fontWeight: "700" },
  issueOptions: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  issueChip: { borderWidth: 1, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 },
  input: { minHeight: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
  addressInput: { minHeight: 72, textAlignVertical: "top" },
  formFootnote: { fontSize: 10, lineHeight: 15 },
  statusTagWrap: { alignSelf: "flex-start" },
  cartLine: { borderWidth: 1, borderRadius: 16, padding: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  cartImage: { width: 68, height: 68, borderRadius: 12 },
  cartDetails: { flex: 1, gap: 3 },
  quantityRow: { flexDirection: "row", alignItems: "center", gap: 11, marginTop: 5 },
  quantityButton: { width: 27, height: 27, borderRadius: 9, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  quantityText: { minWidth: 14, textAlign: "center", fontSize: 12, fontWeight: "700" },
  checkoutCard: { borderWidth: 1, borderRadius: 18, padding: 15, gap: 12, marginTop: 4 },
  setupNotice: { borderRadius: 12, padding: 10, flexDirection: "row", alignItems: "flex-start", gap: 8 },
  setupText: { flex: 1, fontSize: 10, lineHeight: 15 },
  detailCard: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 10 },
  backButton: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
  backText: { fontSize: 12, fontWeight: "600" },
  detailImageWrap: { borderRadius: 16, height: 230, overflow: "hidden", alignItems: "center" },
  detailImage: { width: "100%", height: "100%" },
  detailTitle: { fontSize: 22, fontWeight: "700", lineHeight: 27 },
  detailDescription: { fontSize: 13, lineHeight: 20, marginTop: 4 },
  detailPrice: { fontSize: 22, fontWeight: "700", marginTop: 4 },
  profileCard: { borderWidth: 1, borderRadius: 17, padding: 15, flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  infoCard: { borderWidth: 1, borderRadius: 17, padding: 15, gap: 10 },
  bodyText: { fontSize: 12, lineHeight: 18 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 9 },
  metricCard: { width: "48%", minHeight: 105, borderWidth: 1, borderRadius: 16, padding: 13, justifyContent: "space-between" },
  metricValue: { fontSize: 23, fontWeight: "700" },
  integrationCard: { borderRadius: 16, padding: 14, gap: 8 },
  buttonRow: { flexDirection: "row", gap: 9 },
  socialHero: { borderRadius: 20, padding: 18, gap: 12 },
  socialIcon: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  socialTitle: { fontSize: 20, fontWeight: "700", lineHeight: 25 },
  socialDescription: { fontSize: 12, lineHeight: 18, maxWidth: 260 },
  checkRow: { flexDirection: "row", gap: 9, alignItems: "center" },
  stepCircle: { width: 25, height: 25, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  stepNumber: { fontSize: 11, fontWeight: "700" },
  toast: { position: "absolute", bottom: 94, left: 18, right: 18, borderRadius: 13, paddingVertical: 11, paddingHorizontal: 13, flexDirection: "row", gap: 8, alignItems: "center" },
  toastText: { fontSize: 11, fontWeight: "600", flex: 1 },
  bottomNav: { position: "absolute", left: 12, right: 12, minHeight: 62, borderRadius: 19, borderWidth: 1, paddingHorizontal: 7, flexDirection: "row", alignItems: "center", justifyContent: "space-around", elevation: 6 },
  navButton: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 5 },
  navLabel: { fontSize: 9, fontWeight: "600" },
  smallIconButton: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
